import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: process.env.NEXT_PUBLIC_TEST_ENV === 'e2e',
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: `${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com`,
      },
    ],
  },

  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
    optimizeCss: false,
    scrollRestoration: true,
  },
};

module.exports = nextConfig;
