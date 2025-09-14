import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Disable turbopack for production builds on Vercel
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  // Ensure proper build output
  output: 'standalone',
  // Enable SWC minification
  swcMinify: true,
};

export default nextConfig;