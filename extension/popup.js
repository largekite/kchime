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
    const [meRes, usageRes] = await Promise.all([
      fetch(`${API_BASE}/api/me`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API_BASE}/api/usage`, { headers: { Authorization: `Bearer ${token}` } }),
    ]);

    // Only clear the token on explicit auth rejection (401), not server errors
    if (meRes.status === 401) { await clearToken(); showSignedOut(); return; }
    if (!meRes.ok) { showSignedIn(null, false, null); return; }

    const me = await meRes.json();
    const usage = usageRes.ok ? await usageRes.json() : null;
    showSignedIn(me.email, me.isPro, usage);
  } catch {
    // Network error — still show signed-in with no usage data
    showSignedIn(null, false, null);
  }
});

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

    await setToken(data.token);
    // Fetch live usage now that we have a token
    let usage = null;
    try {
      const ur = await fetch(`${API_BASE}/api/usage`, { headers: { Authorization: `Bearer ${data.token}` } });
      if (ur.ok) usage = await ur.json();
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

function setToken(token) {
  return new Promise(resolve => chrome.runtime.sendMessage({ type: 'SET_TOKEN', token }, resolve));
}

function clearToken() {
  return new Promise(resolve => chrome.runtime.sendMessage({ type: 'CLEAR_TOKEN' }, resolve));
}
