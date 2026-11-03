import type { NextConfig } from 'next';

// Static export for GitHub Pages. Set NEXT_PUBLIC_BASE_PATH="/humble-subscription-hub"
// only when serving from username.github.io/repo (not needed with a custom domain).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
};

export default nextConfig;
