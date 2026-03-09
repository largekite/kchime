import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Old standalone routes → new hub pages
      { source: '/fix', destination: '/reply', permanent: true },
      { source: '/work', destination: '/reply', permanent: true },
      { source: '/converse', destination: '/practice', permanent: true },
      { source: '/live', destination: '/practice', permanent: true },
      { source: '/packs', destination: '/practice', permanent: true },
      { source: '/library', destination: '/learn', permanent: true },
      { source: '/review', destination: '/learn', permanent: true },
      { source: '/daily', destination: '/learn', permanent: true },
      { source: '/dashboard', destination: '/me', permanent: true },
      { source: '/tone', destination: '/me', permanent: true },
      { source: '/contacts', destination: '/me', permanent: true },
      { source: '/refer', destination: '/me', permanent: true },
    ];
  },
};

export default nextConfig;
