# Code Review: Branch Analysis

## Critical Bugs

### 1. TTS Route — Race Condition Wastes API Credits
**File:** `app/api/tts/route.ts:63-73`

The TTS route fires the OpenAI API call **in parallel** with the rate-limit check via `Promise.all`. If the user has exceeded their limit, the OpenAI call has already been made and billed before the limit check returns `false`.

**Fix:** Check the rate limit first, then call OpenAI only if within limit.

### 2. TTS Route — No Rate Limiting for Anonymous Users
**File:** `app/api/tts/route.ts:81-92`

Anonymous users (no auth token) bypass rate limiting entirely and can make unlimited TTS calls, directly costing OpenAI credits with zero accountability.

**Fix:** Add IP-based or session-based rate limiting for anonymous users, or require authentication for TTS.

### 3. Auth Signin — No Token Expiration/Refresh for Extension
**File:** `app/api/auth/signin/route.ts:37`

The endpoint returns the raw `access_token` without `expires_at` or `refresh_token`. The extension stores this token indefinitely in `chrome.storage.local`. Once the JWT expires (default 1 hour), all extension API calls silently fail with 401s until the user manually re-authenticates.

**Fix:** Return `refresh_token` and `expires_at`. Implement token refresh logic in `extension/background.js`.

### 4. TTS `checkAndIncrement` Lacks Optimistic Locking
**File:** `app/api/tts/route.ts:28-48`

Unlike `isRateLimited` in the claude route (which uses `.eq(column, currentCount)` for optimistic locking), `checkAndIncrement` does a plain read-then-write, allowing concurrent requests to both pass the limit check.

**Fix:** Add `.eq('tts_count', count)` to the update query, matching the pattern in `app/api/claude/route.ts`.

## Moderate Bugs

### 5. AuthModal — Loading State Stuck on Empty Forgot Email
**File:** `components/shared/AuthModal.tsx:28-32`

When `mode === 'forgot'` and email is empty, `setLoading(true)` is called (line 28) but the early return on line 32 never resets it. The button stays disabled permanently.

**Fix:** Move the empty-email check before `setLoading(true)`, or reset loading in the guard.

### 6. Extension Manifest — Overly Broad Permissions
**File:** `extension/manifest.json:12`

`host_permissions: ["<all_urls>"]` combined with content scripts matching `<all_urls>` is redundant and will likely trigger Chrome Web Store review flags. The `<all_urls>` host permission is only needed for `kchime.com` API calls.

**Fix:** Change `host_permissions` to `["https://kchime.com/*"]`.

### 7. Speech Recognition — No Cleanup of Old Instances
**File:** `hooks/useSpeechRecognition.ts:107-155`

Calling `start()` multiple times creates new instances without stopping the previous one. Old instances stay active, potentially causing duplicate speech events.

**Fix:** Call `recognitionRef.current?.stop()` at the beginning of `start()`.

## Enhancements

### 8. Redundant Subscription Queries
**Files:** `app/api/me/route.ts`, `app/api/usage/route.ts`

Both endpoints independently query the `subscriptions` table, and the popup calls both in parallel. Consider combining into a single `/api/me` endpoint that also returns usage data.

### 9. No Shadow DOM Isolation for Extension UI
**File:** `extension/content.js`

The extension injects UI directly into the host page DOM. Site CSS can conflict with KChime styles. Using Shadow DOM would prevent style conflicts in both directions.

### 10. `document.execCommand('insertText')` is Deprecated
**File:** `extension/content.js:68`

This is the primary text insertion method for contentEditable fields. Consider migrating to the Clipboard API or Input Events specification.

### 11. TTS Input — No Text Length Validation
**File:** `app/api/tts/route.ts:51`

No validation on text length. A malicious user could send an enormous string, resulting in high OpenAI costs.

**Fix:** Add a max character limit (e.g., 500 chars).

### 12. Extension — Unused `platform` Parameter
**File:** `extension/background.js:8`

The `platform` parameter is passed to `fetchReplies()` but never included in the request body sent to the API.

### 13. Extension — "Hello" Fallback Prompt
**File:** `extension/content.js:306`

When the text field is empty, `'Hello'` is sent as the prompt. This may confuse users who triggered the panel without typing anything. Consider showing a placeholder message instead.

## Alignment with Main Branch

The feature branch is **fully in sync** with master — no divergence detected. All changes from the recent commits (extension feature, reset password, share progress fix, OpenAI speech integration) are present on both branches.
