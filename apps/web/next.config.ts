import type { NextConfig } from 'next'
import withBundleAnalyzer from '@next/bundle-analyzer'

const nextConfig: NextConfig = {
  // Ensure OG meta tags are rendered in the initial HTML (not streamed)
  // for crawlers that don't execute JavaScript (Zalo, Facebook, Googlebot)
  htmlLimitedBots: /Googlebot|facebookexternalhit|Zalo\//i,
  transpilePackages: ['@repo/types'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

const analyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
})

export default analyzer(nextConfig)
