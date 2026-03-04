'use client';

import dynamic from 'next/dynamic';

const OnboardingGuard = dynamic(
  () => import('./OnboardingGuard').then((m) => m.OnboardingGuard),
  { ssr: false }
);

const ServiceWorkerRegistrar = dynamic(
  () => import('./ServiceWorkerRegistrar').then((m) => m.ServiceWorkerRegistrar),
  { ssr: false }
);

export function ClientInit() {
  return (
    <>
      <OnboardingGuard />
      <ServiceWorkerRegistrar />
    </>
  );
}
