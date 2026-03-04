'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { isOnboarded } from '@/lib/storage';

export function OnboardingGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== '/onboarding' && !isOnboarded()) {
      router.replace('/onboarding');
    }
  }, [pathname, router]);

  return null;
}
