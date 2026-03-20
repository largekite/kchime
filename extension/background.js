const API_BASE = 'https://kchime.com';

// Buffer (in ms) before actual expiry to trigger a refresh
const REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 minutes

// Attempt to refresh the access token using the stored refresh token.
// Returns the new access token or null if refresh failed.
async function tryRefreshToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['refreshToken'], async ({ refreshToken }) => {
      if (!refreshToken) { resolve(null); return; }

      try {
        const res = await fetch(`${API_BASE}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) { resolve(null); return; }

        const data = await res.json();
        if (data.token) {
          chrome.storage.local.set({
            token: data.token,
            refreshToken: data.refreshToken,
            expiresAt: data.expiresAt,
          });
          resolve(data.token);
        } else {
          resolve(null);
        }
      } catch {
        resolve(null);
      }
    });
  });
}

// Get a valid token, refreshing if expired or about to expire
async function getValidToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['token', 'expiresAt'], async ({ token, expiresAt }) => {
      if (!token) { resolve(null); return; }

      // Check if token is expired or about to expire
      if (expiresAt) {
        const expiresAtMs = expiresAt * 1000; // expiresAt is in seconds
        if (Date.now() > expiresAtMs - REFRESH_BUFFER_MS) {
          const newToken = await tryRefreshToken();
          resolve(newToken);
          return;
        }
      }

      resolve(token);
    });
  });
}

// Fetch reply suggestions from KChime API
async function fetchReplies(prompt, platform, tone, token) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  const body = { mode: 'replies', prompt, context: platform || 'Any' };
  if (tone) body.toneProfile = { customInstructions: `Prefer a ${tone} tone.`, formality: 0.5, lengthPreference: 'medium', emojiEnabled: false };

  let res;
  try {
    res = await fetch(`${API_BASE}/api/claude`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    clearTimeout(timer);
    if (e.name === 'AbortError') throw new Error('Request timed out. Please try again.');
    throw e;
  }
  clearTimeout(timer);

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// Keyboard command → tell the active tab's content script to open the panel
chrome.commands.onCommand.addListener((command) => {
  if (command !== 'trigger-kchime') return;
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab?.id) chrome.tabs.sendMessage(tab.id, { type: 'KCHIME_TRIGGER' });
  });
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'FETCH_REPLIES') {
    (async () => {
      try {
        const token = await getValidToken();
        const data = await fetchReplies(msg.prompt, msg.platform ?? 'General', msg.tone ?? null, token);
        sendResponse({ ok: true, replies: data.replies });
      } catch (err) {
        sendResponse({ ok: false, error: err.message });
      }
    })();
    return true; // keep channel open for async response
  }

  if (msg.type === 'GET_TOKEN') {
    (async () => {
      const token = await getValidToken();
      sendResponse({ token });
    })();
    return true;
  }

  if (msg.type === 'SET_TOKEN') {
    chrome.storage.local.set({
      token: msg.token,
      refreshToken: msg.refreshToken,
      expiresAt: msg.expiresAt,
    }, () => {
      sendResponse({ ok: true });
    });
    return true;
  }

  if (msg.type === 'CLEAR_TOKEN') {
    chrome.storage.local.remove(['token', 'refreshToken', 'expiresAt'], () => {
      sendResponse({ ok: true });
    });
    return true;
  }
});
