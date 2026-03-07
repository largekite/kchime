'use client';

import Script from 'next/script';

export function AppleSDKInit() {
  return (
    <Script
      src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"
      strategy="lazyOnload"
      onLoad={() => {
        window.AppleID?.auth.init({
          // Must be a Services ID (not the iOS bundle ID) registered in Apple Developer Portal
          clientId: process.env.NEXT_PUBLIC_APPLE_WEB_CLIENT_ID ?? 'com.kchime.web',
          scope: 'name email',
          // Use the current origin so this works in dev (localhost) and production
          redirectURI: `${window.location.origin}/api/auth/apple/web`,
          usePopup: true,
        });
      }}
    />
  );
}
