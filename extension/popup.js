'use strict';

const API_BASE = 'https://kchime.com';

const $ = (id) => document.getElementById(id);

// ── Init ───────────────────────────────────────────────────────────────────

chrome.runtime.sendMessage({ type: 'GET_TOKEN' }, async (response) => {
  // Guard: response can be undefined if the service worker is cold-starting
  const { token } = response || {};
  $('loading').classList.add('hidden');

  if (!token) { showSignedOut(); return; }

  try {
    const meRes = await fetch(`${API_BASE}/api/me`, { headers: { Authorization: `Bearer ${token}` } });

    // On 401, attempt token refresh before giving up
    if (meRes.status === 401) {
      const refreshed = await tryRefreshAndRetry();
      if (refreshed) return; // refreshed successfully, UI already updated
      await clearToken();
      showSignedOut();
      return;
    }
    if (!meRes.ok) { showSignedIn(null, false, null); return; }

    const me = await meRes.json();
    showSignedIn(me.email, me.isPro, me.usage ?? null);
  } catch {
    // Network error — still show signed-in with no usage data
    showSignedIn(null, false, null);
  }
});

// Attempt to refresh the token and re-fetch user data
async function tryRefreshAndRetry() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['refreshToken'], async ({ refreshToken }) => {
      if (!refreshToken) { resolve(false); return; }

      try {
        const res = await fetch(`${API_BASE}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) { resolve(false); return; }

        const data = await res.json();
        if (!data.token) { resolve(false); return; }

        // Store new tokens
        await setToken(data.token, data.refreshToken, data.expiresAt);

        // Re-fetch user data with new token
        const meRes = await fetch(`${API_BASE}/api/me`, { headers: { Authorization: `Bearer ${data.token}` } });
        if (!meRes.ok) { resolve(false); return; }

        const me = await meRes.json();
        showSignedIn(me.email, me.isPro, me.usage ?? null);
        resolve(true);
      } catch {
        resolve(false);
      }
    });
  });
}

// ── PKCE helpers ─────────────────────────────────────────────────────────

function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function generateCodeChallenge(verifier) {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// ── Google sign-in ───────────────────────────────────────────────────────

$('google-sign-in-btn').addEventListener('click', handleGoogleSignIn);

async function handleGoogleSignIn() {
  const btn = $('google-sign-in-btn');
  btn.disabled = true;
  btn.textContent = 'Signing in…';
  $('auth-error').classList.add('hidden');

  try {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const redirectUrl = chrome.identity.getRedirectURL();

    // Get the Google OAuth URL from our server
    const urlRes = await fetch(
      `${API_BASE}/api/auth/google-extension?redirect=${encodeURIComponent(redirectUrl)}&code_challenge=${encodeURIComponent(codeChallenge)}`
    );
    if (!urlRes.ok) throw new Error('Could not get auth URL');
    const { url: authUrl } = await urlRes.json();

    // Open Google sign-in flow
    const responseUrl = await new Promise((resolve, reject) => {
      chrome.identity.launchWebAuthFlow({ url: authUrl, interactive: true }, (callbackUrl) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(callbackUrl);
        }
      });
    });

    // Extract the authorization code from the redirect URL
    const params = new URL(responseUrl).searchParams;
    const code = params.get('code');
    if (!code) throw new Error('No authorization code received');

    // Exchange code for tokens
    const tokenRes = await fetch(`${API_BASE}/api/auth/google-extension`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, codeVerifier }),
    });
    const data = await tokenRes.json();
    if (!tokenRes.ok || !data.token) throw new Error(data.error || 'Token exchange failed');

    await setToken(data.token, data.refreshToken, data.expiresAt);

    // Fetch user data
    let email = null, isPro = false, usage = null;
    try {
      const meRes = await fetch(`${API_BASE}/api/me`, { headers: { Authorization: `Bearer ${data.token}` } });
      if (meRes.ok) {
        const me = await meRes.json();
        email = me.email;
        isPro = me.isPro;
        usage = me.usage ?? null;
      }
    } catch { /* ignore */ }
    showSignedIn(email, isPro, usage);
  } catch (err) {
    const msg = err.message || 'Google sign-in failed';
    if (msg.includes('canceled') || msg.includes('closed')) {
      // User closed the popup — not an error
    } else {
      showError(msg);
    }
    btn.disabled = false;
    btn.innerHTML = `<svg viewBox="0 0 24 24" style="width:16px;height:16px;flex-shrink:0" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> Continue with Google`;
  }
}

// ── Sign-in form ──────────────────────────────────────────────────────────

$('sign-in-btn').addEventListener('click', handleSignIn);
$('password').addEventListener('keydown', e => { if (e.key === 'Enter') handleSignIn(); });
$('email').addEventListener('keydown', e => { if (e.key === 'Enter') $('password').focus(); });

async function handleSignIn() {
  const email = $('email').value.trim();
  const password = $('password').value.trim();
  if (!email || !password) { showError('Please enter your email and password.'); return; }

  const btn = $('sign-in-btn');
  btn.disabled = true;
  btn.textContent = 'Signing in…';
  $('auth-error').classList.add('hidden');

  try {
    const res = await fetch(`${API_BASE}/api/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok || !data.token) {
      showError(data.error || 'Sign in failed. Check your credentials.');
      btn.disabled = false;
      btn.textContent = 'Sign in';
      return;
    }

    await setToken(data.token, data.refreshToken, data.expiresAt);
    // Fetch live usage now that we have a token
    let usage = null;
    try {
      const meRes = await fetch(`${API_BASE}/api/me`, { headers: { Authorization: `Bearer ${data.token}` } });
      if (meRes.ok) {
        const me = await meRes.json();
        usage = me.usage ?? null;
      }
    } catch { /* ignore, usage card stays hidden */ }
    showSignedIn(email, data.isPro ?? false, usage);
  } catch {
    showError('Could not connect to KChime. Check your connection.');
    btn.disabled = false;
    btn.textContent = 'Sign in';
  }
}

// ── Sign out ──────────────────────────────────────────────────────────────

$('sign-out-btn').addEventListener('click', async () => {
  await clearToken();
  showSignedOut();
});

// ── UI helpers ─────────────────────────────────────────────────────────────

function showSignedOut() {
  $('signed-in').classList.add('hidden');
  $('signed-out').classList.remove('hidden');
  setTimeout(() => $('email').focus(), 50);
}

function showSignedIn(email, isPro, usage) {
  $('signed-out').classList.add('hidden');
  $('signed-in').classList.remove('hidden');

  // User row
  if (email) {
    $('user-email').textContent = email;
    $('user-avatar').textContent = email[0].toUpperCase();
  } else {
    $('user-email').textContent = 'Signed in';
    $('user-avatar').textContent = '✓';
  }

  const badge = $('plan-badge');
  if (isPro) {
    badge.textContent = 'Pro ✦';
    badge.className = 'badge badge-pro';
    $('upgrade-strip').classList.add('hidden');
  } else {
    badge.textContent = 'Free';
    badge.className = 'badge badge-free';
    $('upgrade-strip').classList.remove('hidden');
  }

  // Usage bar
  if (usage && typeof usage.count === 'number' && typeof usage.limit === 'number') {
    const pct = Math.min(100, Math.round((usage.count / usage.limit) * 100));
    $('usage-text').textContent = `${usage.count} / ${usage.limit}`;
    $('usage-bar').style.width = `${pct}%`;
    if (pct >= 80) $('usage-bar').style.background = pct >= 100 ? '#dc2626' : '#f59e0b';
    $('usage-card').classList.remove('hidden');
  } else {
    $('usage-card').classList.add('hidden');
  }
}

function showError(msg) {
  const el = $('auth-error');
  el.textContent = msg;
  el.classList.remove('hidden');
}

// ── Token helpers ─────────────────────────────────────────────────────────

function setToken(token, refreshToken, expiresAt) {
  return new Promise(resolve => chrome.runtime.sendMessage({ type: 'SET_TOKEN', token, refreshToken, expiresAt }, resolve));
}

function clearToken() {
  return new Promise(resolve => chrome.runtime.sendMessage({ type: 'CLEAR_TOKEN' }, resolve));
}
