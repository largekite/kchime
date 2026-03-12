const API_BASE = 'https://kchime.com';

// Fetch reply suggestions from KChime API
async function fetchReplies(prompt, platform, tone, token) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  const body = { mode: 'replies', prompt, context: 'Any' };
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
    chrome.storage.local.get(['token'], async ({ token }) => {
      try {
        const data = await fetchReplies(msg.prompt, msg.platform ?? 'General', msg.tone ?? null, token ?? null);
        sendResponse({ ok: true, replies: data.replies });
      } catch (err) {
        sendResponse({ ok: false, error: err.message });
      }
    });
    return true; // keep channel open for async response
  }

  if (msg.type === 'GET_TOKEN') {
    chrome.storage.local.get(['token'], ({ token }) => {
      sendResponse({ token: token ?? null });
    });
    return true;
  }

  if (msg.type === 'SET_TOKEN') {
    chrome.storage.local.set({ token: msg.token }, () => {
      sendResponse({ ok: true });
    });
    return true;
  }

  if (msg.type === 'CLEAR_TOKEN') {
    chrome.storage.local.remove('token', () => {
      sendResponse({ ok: true });
    });
    return true;
  }
});
