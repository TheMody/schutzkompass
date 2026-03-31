import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: [
    '@schutzkompass/ui',
    '@schutzkompass/db',
    '@schutzkompass/shared',
    '@schutzkompass/compliance-content',
  ],
};

export default nextConfig;
