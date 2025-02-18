import type { NextConfig } from 'next'
import initializeBundleAnalyzer from '@next/bundle-analyzer'

// https://www.npmjs.com/package/@next/bundle-analyzer
const withBundleAnalyzer = initializeBundleAnalyzer({
  enabled: true,
})

// https://nextjs.org/docs/pages/api-reference/next-config-js
const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    turbo: {},
    nodeMiddleware: true,
  },
  images: {
    remotePatterns: [
        {
            protocol: 'https',
            hostname: 'image.tmdb.org',
        }
    ]
  }
}

export default process.env.BUNDLE_ANALYZER_ENABLED === 'true' ? withBundleAnalyzer(nextConfig) : nextConfig
