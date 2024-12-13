import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: process.env.NEXT_PUBLIC_TEST_ENV === 'e2e',

  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
    dirs: ['src'],
  },

  images: {
    remotePatterns: [
      { hostname: 'utfs.io' },
      { hostname: 'apadana.app' },
      { hostname: 'localhost' },
      { hostname: 'avatars.githubusercontent.com' },
      {
        hostname: `${process.env.NEXT_PUBLIC_S3_UPLOAD_BUCKET}.s3.amazonaws.com`,
      },
      {
        hostname: `${process.env.NEXT_PUBLIC_S3_UPLOAD_BUCKET}.s3.${process.env.NEXT_PUBLIC_S3_UPLOAD_REGION}.amazonaws.com`,
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
  },

  webpack(config) {
    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find((rule: { test: RegExp }) =>
      rule.test?.test?.('.svg'),
    );

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: { not: /\.(css|scss|sass)$/ },
        resourceQuery: { not: /url/ }, // exclude if *.svg?url
        loader: '@svgr/webpack',
        options: {
          dimensions: false,
          titleProp: true,
        },
      },
    );

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  },
};

module.exports = nextConfig;
