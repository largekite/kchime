// KChime content script — injects reply suggestions near focused text fields
(function () {
  'use strict';

  if (window.__kchimeLoaded) return;
  window.__kchimeLoaded = true;

  let activeField = null;
  let widgetHost = null; // Shadow DOM host for the widget
  let widgetShadow = null;
  let widget = null;
  let panelHost = null; // Shadow DOM host for the panel
  let panelShadow = null;
  let panel = null;
  let isOpen = false;
  let selectedTone = null; // null = auto
  let fetchGen = 0; // incremented each fetch; stale callbacks check against it
  let injectedStyles = null; // cached CSS text for shadow roots

  // ── Load CSS for shadow DOM ───────────────────────────────────────────────

  // Fetch the CSS file and cache it for injection into shadow roots
  function getStyles() {
    if (injectedStyles) return Promise.resolve(injectedStyles);
    return fetch(chrome.runtime.getURL('content.css'))
      .then(r => r.text())
      .then(css => { injectedStyles = css; return css; });
  }

  function injectStyles(shadowRoot) {
    getStyles().then(css => {
      const style = document.createElement('style');
      style.textContent = css;
      shadowRoot.appendChild(style);
    });
  }

  // ── Platform detection ─────────────────────────────────────────────────────

  // Patterns anchored with (^|\.) so "moreddit.com" doesn't match reddit.com, etc.
  const PLATFORMS = [
    { pattern: /(^|\.)mail\.google\.com$/, name: 'Gmail' },
    { pattern: /(^|\.)linkedin\.com$/, name: 'LinkedIn' },
    { pattern: /(^|\.)slack\.com$/, name: 'Slack' },
    { pattern: /(^|\.)twitter\.com$|(^|\.)x\.com$/, name: 'Twitter/X' },
    { pattern: /(^|\.)whatsapp\.com$/, name: 'WhatsApp' },
    { pattern: /(^|\.)outlook\.(live|office)\.com$/, name: 'Outlook' },
    { pattern: /(^|\.)teams\.microsoft\.com$/, name: 'Microsoft Teams' },
    { pattern: /(^|\.)discord\.com$/, name: 'Discord' },
    { pattern: /(^|\.)messenger\.com$/, name: 'Facebook Messenger' },
    { pattern: /(^|\.)reddit\.com$/, name: 'Reddit' },
  ];

  function detectPlatform() {
    const host = window.location.hostname;
    for (const p of PLATFORMS) {
      if (p.pattern.test(host)) return p.name;
    }
    // Truncate long page titles to 30 chars
    const title = (document.title || '').replace(/\s*[-|–]\s*.+$/, '').trim();
    return title.length > 30 ? title.slice(0, 28) + '…' : title || 'General';
  }

  const TONES = [
    { id: null,          label: 'Auto',         color: '#6b7280' },
    { id: 'professional', label: 'Professional', color: '#1d4ed8' },
    { id: 'friendly',    label: 'Friendly',     color: '#059669' },
    { id: 'concise',     label: 'Concise',      color: '#7c3aed' },
    { id: 'playful',     label: 'Playful',      color: '#d97706' },
    { id: 'bold',        label: 'Bold',         color: '#dc2626' },
  ];

  // ── Thread context extraction ─────────────────────────────────────────────

  // Returns structured context: { subject, messages: [{from, text}] }
  // or null if no context is available
  function getThreadContext(el, platform) {
    if (!el) return null;
    try {
      if (platform === 'Gmail') return getGmailContext(el);
      if (platform === 'Outlook') return getOutlookContext(el);
      if (platform === 'LinkedIn') return getLinkedInContext(el);
      if (platform === 'Slack') return getSlackContext(el);
      if (platform === 'Discord') return getDiscordContext(el);
    } catch { /* DOM access can throw; ignore */ }
    return null;
  }

  // Truncate a message body, preserving the start and end for context
  function smartTruncate(text, maxLen) {
    if (!text || text.length <= maxLen) return text;
    const keepStart = Math.floor(maxLen * 0.7);
    const keepEnd = Math.floor(maxLen * 0.25);
    return text.slice(0, keepStart) + '\n[…truncated…]\n' + text.slice(-keepEnd);
  }

  function getGmailContext(el) {
    // Walk up to the thread container
    const container = el.closest('[role="list"]') || el.closest('.nH');
    if (!container) return null;

    // Subject line — Gmail shows it in h2.hP or the page title
    let subject = '';
    const subjectEl = container.querySelector('h2.hP') || document.querySelector('h2.hP');
    if (subjectEl) {
      subject = (subjectEl.textContent || '').trim();
    } else {
      // Fallback: extract from page title ("Subject - user@email.com - Gmail")
      const titleMatch = document.title.match(/^(.+?)\s*-\s*[^-]+@/);
      if (titleMatch) subject = titleMatch[1].trim();
    }

    // Collect all email messages in the thread
    const emailEls = container.querySelectorAll('[data-message-id], .kv, .gs');
    const messages = [];

    if (emailEls.length > 0) {
      for (const emailEl of emailEls) {
        // Skip if this is inside the compose area
        if (el.contains(emailEl) || emailEl.contains(el)) continue;

        // Sender
        const senderEl = emailEl.querySelector('[email], .gD, .go, [data-hovercard-id]');
        const from = senderEl
          ? (senderEl.getAttribute('name') || senderEl.textContent || '').trim()
          : '';

        // Body — try multiple selectors
        const bodyEl = emailEl.querySelector('.a3s.aiL, .ii.gt, [data-message-id] .a3s');
        if (!bodyEl) continue;
        const text = (bodyEl.innerText || '').trim();
        if (!text) continue;

        messages.push({ from, text });
      }
    }

    // Fallback: use the simpler body selector if no messages found via message IDs
    if (messages.length === 0) {
      const bodies = container.querySelectorAll('.a3s.aiL, .ii.gt');
      for (const body of bodies) {
        if (el.contains(body) || body.contains(el)) continue;
        const text = (body.innerText || '').trim();
        if (!text) continue;
        // Try to find the sender above this body
        let from = '';
        const parent = body.closest('.gs, .kv, [data-message-id]');
        if (parent) {
          const s = parent.querySelector('[email], .gD, .go');
          from = s ? (s.getAttribute('name') || s.textContent || '').trim() : '';
        }
        messages.push({ from, text });
      }
    }

    if (messages.length === 0) return null;

    // For long threads: keep first message + last 3 messages
    let selected;
    if (messages.length > 4) {
      selected = [
        { ...messages[0], text: smartTruncate(messages[0].text, 800) },
        { from: '', text: `[…${messages.length - 4} earlier messages omitted…]` },
        ...messages.slice(-3).map(m => ({ ...m, text: smartTruncate(m.text, 1000) })),
      ];
    } else {
      selected = messages.map(m => ({ ...m, text: smartTruncate(m.text, 1200) }));
    }

    return { subject, messages: selected };
  }

  function getOutlookContext(el) {
    const thread = el.closest('[role="main"]') || el.closest('.ReadMsgContainer');
    if (!thread) return null;

    // Subject
    let subject = '';
    const subjectEl = thread.querySelector('[role="heading"], .allowTextSelection');
    if (subjectEl) subject = (subjectEl.textContent || '').trim();

    // Try to get individual messages first
    const msgEls = thread.querySelectorAll('[data-convid], .ItemContent, [class*="ConversationItem"]');
    const messages = [];

    if (msgEls.length > 0) {
      for (const msgEl of msgEls) {
        if (el.contains(msgEl) || msgEl.contains(el)) continue;
        const senderEl = msgEl.querySelector('[class*="sender"], [class*="From"]');
        const from = senderEl ? (senderEl.textContent || '').trim() : '';
        const bodyEl = msgEl.querySelector('[class*="BodyFragment"], [role="document"]');
        const text = bodyEl ? (bodyEl.innerText || '').trim() : '';
        if (text) messages.push({ from, text: smartTruncate(text, 1200) });
      }
    }

    // Fallback: grab quoted text
    if (messages.length === 0) {
      const quoted = thread.querySelector('[id*="divRplyFwdMsg"], .QuotedText, [class*="quotedText"]');
      if (!quoted) return null;
      const text = (quoted.innerText || '').trim();
      if (!text) return null;
      messages.push({ from: '', text: smartTruncate(text, 2000) });
    }

    if (messages.length === 0) return null;
    return { subject, messages };
  }

  function getLinkedInContext(el) {
    const feed = el.closest('.msg-convo-wrapper, [class*="messaging"], [class*="msg-thread"]');
    if (!feed) return null;

    const msgEls = feed.querySelectorAll('.msg-s-event-listitem, [class*="msg-s-message"]');
    const messages = [];

    for (const msgEl of msgEls) {
      const senderEl = msgEl.querySelector('.msg-s-message-group__name, [class*="sender"]');
      const from = senderEl ? (senderEl.textContent || '').trim() : '';
      const bodyEl = msgEl.querySelector('.msg-s-event-listitem__body, [class*="message-body"]');
      const text = bodyEl ? (bodyEl.innerText || '').trim() : '';
      if (text) messages.push({ from, text });
    }

    // Fallback: simpler selectors
    if (messages.length === 0) {
      const bodyEls = feed.querySelectorAll('.msg-s-event-listitem__body, [class*="message-body"]');
      for (const bodyEl of bodyEls) {
        const text = (bodyEl.innerText || '').trim();
        if (text) messages.push({ from: '', text });
      }
    }

    if (messages.length === 0) return null;

    // Keep last 5 messages for chat context
    const selected = messages.slice(-5).map(m => ({ ...m, text: smartTruncate(m.text, 500) }));
    return { subject: '', messages: selected };
  }

  function getSlackContext(el) {
    // Slack messages are in .c-virtual_list__item or similar containers
    const thread = el.closest('[class*="thread"], [class*="message_pane"], [class*="virtual_list"]')
      || el.closest('[role="main"]');
    if (!thread) return null;

    // Channel name
    let subject = '';
    const channelEl = document.querySelector('[data-qa="channel_name"], [class*="channel_header"] button');
    if (channelEl) subject = (channelEl.textContent || '').trim();

    const msgEls = thread.querySelectorAll('[class*="message_content"], [data-qa="message_content"]');
    const messages = [];

    for (const msgEl of msgEls) {
      if (el.contains(msgEl) || msgEl.contains(el)) continue;
      const parent = msgEl.closest('[class*="message_kit"]') || msgEl.parentElement;
      const senderEl = parent?.querySelector('[data-qa="message_sender_name"], [class*="sender"]');
      const from = senderEl ? (senderEl.textContent || '').trim() : '';
      const text = (msgEl.innerText || '').trim();
      if (text) messages.push({ from, text });
    }

    if (messages.length === 0) return null;

    // Keep last 5 messages
    const selected = messages.slice(-5).map(m => ({ ...m, text: smartTruncate(m.text, 500) }));
    return { subject, messages: selected };
  }

  function getDiscordContext(el) {
    const chat = el.closest('[class*="chatContent"], [class*="chat-"]') || el.closest('main');
    if (!chat) return null;

    // Channel name
    let subject = '';
    const channelEl = document.querySelector('[class*="title-"] h1, [class*="channelName"]');
    if (channelEl) subject = (channelEl.textContent || '').trim();

    const msgEls = chat.querySelectorAll('[id^="chat-messages-"], [class*="messageContent"]');
    const messages = [];

    for (const msgEl of msgEls) {
      if (el.contains(msgEl) || msgEl.contains(el)) continue;
      const parent = msgEl.closest('[class*="message-"]') || msgEl.parentElement;
      const senderEl = parent?.querySelector('[class*="username"], [id*="message-username"]');
      const from = senderEl ? (senderEl.textContent || '').trim() : '';
      const contentEl = msgEl.querySelector('[id^="message-content-"]') || msgEl;
      const text = (contentEl.innerText || '').trim();
      if (text) messages.push({ from, text });
    }

    if (messages.length === 0) return null;

    const selected = messages.slice(-5).map(m => ({ ...m, text: smartTruncate(m.text, 500) }));
    return { subject, messages: selected };
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  function getFieldText(el) {
    if (!el) return '';
    if (el.isContentEditable) return (el.innerText || '').trim();
    return (el.value || '').trim();
  }

  function insertText(el, text) {
    if (!el) return;
    el.focus();
    if (el.isContentEditable) {
      // Use InputEvent-based insertion (modern replacement for execCommand)
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
      // Try InputEvent approach first, fall back to execCommand
      const inputEvent = new InputEvent('beforeinput', {
        inputType: 'insertText',
        data: text,
        bubbles: true,
        cancelable: true,
      });
      const accepted = el.dispatchEvent(inputEvent);
      if (accepted) {
        // The app didn't prevent default, so we need to actually insert the text
        // execCommand is deprecated but still the most reliable cross-browser method
        // for triggering the app's input handling (React, Angular, etc.)
        document.execCommand('insertText', false, text);
      }
    } else {
      const end = el.value.length;
      el.setRangeText(text, end, end, 'end');
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function isTextInput(el) {
    if (!el) return false;
    if (el.dataset?.kchimeClipboard) return false; // skip our clipboard helper textarea
    const tag = el.tagName;
    if (tag === 'TEXTAREA') return true;
    if (tag === 'INPUT') {
      const type = (el.type || '').toLowerCase();
      return ['text', 'email', 'search', 'url', ''].includes(type);
    }
    if (el.isContentEditable) return true;
    return false;
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback: use a hidden textarea — mark it so focusin ignores it
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.dataset.kchimeClipboard = '1';
      ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none;left:-9999px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    }
  }

  // ── Widget positioning ─────────────────────────────────────────────────────

  function positionWidget() {
    if (!activeField || !widgetHost) return;
    const rect = activeField.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const vw = window.innerWidth;

    // Horizontal: align to right edge of field, clamped within viewport
    let left = rect.right + scrollX - 130;
    if (left + 130 > scrollX + vw - 8) left = scrollX + vw - 138;
    if (left < scrollX + 8) left = scrollX + 8;

    widgetHost.style.top = `${rect.bottom + scrollY + 5}px`;
    widgetHost.style.left = `${left}px`;
  }

  function positionPanel() {
    if (!panelHost || !activeField || !widgetHost) return;
    const rect = activeField.getBoundingClientRect();
    const panelH = panelHost.offsetHeight || 300;
    const panelW = panelHost.offsetWidth || 300;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    // Horizontal: same left as widget, clamped (guard NaN if widget not yet positioned)
    let left = parseFloat(widgetHost.style.left);
    if (isNaN(left)) left = scrollX + vw - panelW - 8;
    if (left + panelW > scrollX + vw - 8) left = scrollX + vw - panelW - 8;
    if (left < scrollX + 8) left = scrollX + 8;

    // Vertical: below field by default, flip above if not enough room
    const spaceBelow = vh - rect.bottom;
    let top;
    if (spaceBelow >= panelH + 50 || rect.top < panelH + 50) {
      top = rect.bottom + scrollY + 36; // below button
    } else {
      top = rect.top + scrollY - panelH - 10; // above field
    }

    panelHost.style.top = `${top}px`;
    panelHost.style.left = `${left}px`;
  }

  // ── Panel HTML builders ────────────────────────────────────────────────────

  function buildHeader(subtitle) {
    return `
      <div id="kchime-panel-header">
        <span id="kchime-panel-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2.5" style="width:13px;height:13px;flex-shrink:0">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          KChime
          ${subtitle ? `<span id="kchime-platform-badge">${escHtml(subtitle)}</span>` : ''}
        </span>
        <button id="kchime-close" aria-label="Close">&times;</button>
      </div>`;
  }

  function buildToneChips() {
    return `
      <div id="kchime-tones">
        ${TONES.map(t => `
          <button class="kchime-tone-chip${selectedTone === t.id ? ' active' : ''}"
            data-tone="${t.id ?? ''}"
            style="--tone-color:${t.color}"
          >${escHtml(t.label)}</button>
        `).join('')}
      </div>`;
  }

  // onToneChange: optional callback when user picks a different tone
  function bindToneChips(el, onToneChange) {
    el.querySelectorAll('.kchime-tone-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const raw = btn.dataset.tone;
        const next = raw === '' ? null : raw;
        const changed = next !== selectedTone;
        selectedTone = next;
        el.querySelectorAll('.kchime-tone-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (changed && onToneChange) onToneChange();
      });
    });
  }

  // ── Panel states ──────────────────────────────────────────────────────────

  function showLoading(platform) {
    if (!panel) return;
    panel.innerHTML = `
      ${buildHeader(platform)}
      ${buildToneChips()}
      <div id="kchime-loading">
        <span class="kchime-spinner"></span> Getting suggestions…
      </div>`;
    panel.querySelector('#kchime-close').addEventListener('click', closePanel);
    // Tone changes during loading restart the fetch
    bindToneChips(panel, () => fetchAndShowReplies(platform));
    setTimeout(positionPanel, 0);
  }

  function showError(msg) {
    if (!panel) return;
    const platform = detectPlatform();
    panel.innerHTML = `
      ${buildHeader(platform)}
      <div id="kchime-error">${msg}</div>`;
    panel.querySelector('#kchime-close').addEventListener('click', closePanel);
    setTimeout(positionPanel, 0);
  }

  function showEmptyPrompt(platform) {
    if (!panel) return;
    panel.innerHTML = `
      ${buildHeader(platform)}
      <div id="kchime-error" style="color:#6b7280;background:#f9fafb">
        Type a message first, then click <strong>KChime</strong> to get reply suggestions.
      </div>`;
    panel.querySelector('#kchime-close').addEventListener('click', closePanel);
    setTimeout(positionPanel, 0);
  }

  function showReplies(replies, platform) {
    if (!panel) return;
    if (!replies.length) {
      showError('No suggestions returned. Try rephrasing or click Regenerate.');
      // Re-add Regenerate button below error
      const footer = document.createElement('div');
      footer.id = 'kchime-panel-footer';
      footer.innerHTML = `<button id="kchime-regen-empty" style="display:flex;align-items:center;gap:4px;font-size:11px;font-weight:600;color:#6b7280;background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:4px 9px;cursor:pointer">Regenerate</button>`;
      panel.appendChild(footer);
      panel.querySelector('#kchime-regen-empty').addEventListener('click', () => fetchAndShowReplies(platform));
      return;
    }
    const items = replies.map((r, i) => `
      <div class="kchime-reply-item" data-index="${i}">
        <div class="kchime-reply-body">
          <span class="kchime-reply-text">${escHtml(r.text)}</span>
          <span class="kchime-reply-tone">${escHtml(r.tone)}</span>
        </div>
        <div class="kchime-reply-actions">
          <button class="kchime-reply-btn kchime-reply-use" data-index="${i}">Use</button>
          <button class="kchime-reply-btn kchime-reply-copy" data-index="${i}">Copy</button>
        </div>
      </div>`).join('');

    panel.innerHTML = `
      ${buildHeader(platform)}
      ${buildToneChips()}
      <div id="kchime-replies">${items}</div>
      <div id="kchime-panel-footer">
        <button id="kchime-regen">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:11px;height:11px">
            <path d="M1 4v6h6M23 20v-6h-6" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Regenerate
        </button>
        <a href="https://kchime.com" target="_blank" id="kchime-footer-brand">kchime.com</a>
      </div>`;

    panel.querySelector('#kchime-close').addEventListener('click', closePanel);
    // Tone changes while replies are shown auto-regenerate
    bindToneChips(panel, () => fetchAndShowReplies(platform));

    panel.querySelectorAll('.kchime-reply-use').forEach(btn => {
      btn.addEventListener('click', e => {
        const idx = parseInt(e.currentTarget.dataset.index, 10);
        insertText(activeField, replies[idx].text);
        btn.textContent = '✓ Used';
        setTimeout(closePanel, 500);
      });
    });

    panel.querySelectorAll('.kchime-reply-copy').forEach(btn => {
      btn.addEventListener('click', async e => {
        const idx = parseInt(e.currentTarget.dataset.index, 10);
        await copyToClipboard(replies[idx].text);
        btn.textContent = '✓';
        setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
      });
    });

    panel.querySelector('#kchime-regen').addEventListener('click', () => {
      fetchAndShowReplies(platform);
    });

    setTimeout(positionPanel, 0);
  }

  // ── Fetch replies ─────────────────────────────────────────────────────────

  function fetchAndShowReplies(platform) {
    const gen = ++fetchGen; // capture generation; any older callback will be discarded
    const draft = getFieldText(activeField);
    const threadContext = getThreadContext(activeField, platform);

    // Build the prompt from draft and/or thread context
    let prompt;
    if (threadContext && threadContext.messages?.length > 0) {
      // Use the last message in the thread as the primary prompt
      const lastMsg = threadContext.messages[threadContext.messages.length - 1];
      prompt = lastMsg.text || draft;
    } else {
      prompt = draft;
    }

    // Show helpful message instead of sending empty/placeholder prompt
    if (!prompt && !threadContext) {
      showEmptyPrompt(platform);
      return;
    }

    showLoading(platform);

    chrome.runtime.sendMessage(
      { type: 'FETCH_REPLIES', prompt: prompt || '', platform, tone: selectedTone, threadContext, draft },
      (response) => {
        // Discard if panel closed or a newer fetch started
        if (gen !== fetchGen || !panel) return;

        if (chrome.runtime.lastError) {
          showError('Could not connect to KChime extension. Try reloading the page.');
          return;
        }
        if (!response?.ok) {
          const msg = response?.error || 'Unknown error';
          if (msg.includes('401') || msg.toLowerCase().includes('auth') || msg.includes('sign in')) {
            showError('Please sign in to KChime.<br><a href="#" id="kchime-open-ext" style="color:#4f46e5;font-weight:600">Open extension →</a>');
            panel?.querySelector('#kchime-open-ext')?.addEventListener('click', e => {
              e.preventDefault();
              const note = document.createElement('p');
              note.style.cssText = 'font-size:11px;color:#6b7280;margin-top:6px';
              note.textContent = 'Click the KChime icon in your toolbar to sign in.';
              e.target.parentElement.appendChild(note);
            });
          } else if (msg.includes('limit') || msg.includes('429')) {
            showError('Daily limit reached. <a href="https://kchime.com/pro" target="_blank" style="color:#4f46e5;font-weight:600">Upgrade to Pro →</a>');
          } else {
            showError(`${escHtml(msg)}<br><button id="kchime-retry" style="margin-top:6px;font-size:11px;color:#4f46e5;background:none;border:none;cursor:pointer;padding:0;font-weight:600">Try again →</button>`);
            panel?.querySelector('#kchime-retry')?.addEventListener('click', () => fetchAndShowReplies(platform));
          }
          return;
        }
        showReplies(response.replies || [], platform);
      }
    );
  }

  // ── Open / close ──────────────────────────────────────────────────────────

  function openPanel() {
    if (!activeField || !widgetHost) return;
    if (isOpen) { closePanel(); return; }
    isOpen = true;

    // Panel lives in its own Shadow DOM host for style isolation
    panelHost = document.createElement('div');
    panelHost.id = 'kchime-panel-host';
    panelHost.style.cssText = 'position:absolute;z-index:2147483647;';
    panelShadow = panelHost.attachShadow({ mode: 'closed' });
    injectStyles(panelShadow);

    panel = document.createElement('div');
    panel.id = 'kchime-panel';
    panelShadow.appendChild(panel);
    document.body.appendChild(panelHost);

    const platform = detectPlatform();
    fetchAndShowReplies(platform);
  }

  function closePanel() {
    fetchGen++; // invalidate any in-flight request
    if (panelHost) { panelHost.remove(); panelHost = null; panelShadow = null; }
    panel = null;
    isOpen = false;
  }

  // ── Trigger button ────────────────────────────────────────────────────────

  function createWidget() {
    // Widget lives in its own Shadow DOM host for style isolation
    const host = document.createElement('div');
    host.id = 'kchime-widget-host';
    host.style.cssText = 'position:absolute;z-index:2147483646;pointer-events:none;';
    const shadow = host.attachShadow({ mode: 'closed' });
    injectStyles(shadow);

    const div = document.createElement('div');
    div.id = 'kchime-widget';
    shadow.appendChild(div);

    const btn = document.createElement('button');
    btn.id = 'kchime-btn';
    btn.setAttribute('aria-label', 'Get KChime reply suggestions');
    btn.title = 'Get AI reply suggestions (Alt+K)';
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      KChime`;
    btn.addEventListener('click', e => { e.stopPropagation(); openPanel(); });

    div.appendChild(btn);
    widgetShadow = shadow;
    return host;
  }

  function showWidget() {
    if (!widgetHost) {
      widgetHost = createWidget();
      document.body.appendChild(widgetHost);
    }
    positionWidget();
    widgetHost.style.display = 'block';
  }

  function hideWidget() {
    closePanel();
    if (widgetHost) { widgetHost.style.display = 'none'; }
    activeField = null;
  }

  // ── Helpers for Shadow DOM element checks ─────────────────────────────────

  function isOwnUI(el) {
    if (!el) return false;
    // Check if the element is inside our shadow DOM hosts
    if (widgetHost && (el === widgetHost || widgetHost.contains(el))) return true;
    if (panelHost && (el === panelHost || panelHost.contains(el))) return true;
    return false;
  }

  // ── Event listeners ───────────────────────────────────────────────────────

  document.addEventListener('focusin', e => {
    const el = e.target;
    // Ignore focus events from our own UI or the clipboard helper textarea
    if (isOwnUI(el) || el.dataset?.kchimeClipboard) return;
    if (!isTextInput(el)) { hideWidget(); return; }
    activeField = el;
    showWidget();
  }, true);

  document.addEventListener('focusout', () => {
    setTimeout(() => {
      const focused = document.activeElement;
      if (!focused) { hideWidget(); return; }
      if (isOwnUI(focused)) return;
      if (!isTextInput(focused)) hideWidget();
    }, 180);
  }, true);

  window.addEventListener('scroll', () => { positionWidget(); if (isOpen) positionPanel(); }, { passive: true });
  window.addEventListener('resize', () => { positionWidget(); if (isOpen) positionPanel(); }, { passive: true });

  // Close panel on outside click
  document.addEventListener('click', e => {
    if (!isOpen) return;
    if (!isOwnUI(e.target)) closePanel();
  }, true);

  // Keyboard shortcut: Alt+K (in-page handler as fallback)
  document.addEventListener('keydown', e => {
    if (e.altKey && e.key === 'k') {
      e.preventDefault();
      if (isOpen) { closePanel(); return; }
      if (activeField) openPanel();
    }
    // Escape closes panel
    if (e.key === 'Escape' && isOpen) closePanel();
  });

  // Command from background service worker (registered keyboard shortcut)
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'KCHIME_TRIGGER') {
      if (isOpen) { closePanel(); return; }
      if (activeField) openPanel();
    }
  });
})();
