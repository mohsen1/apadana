import { readFileSync } from 'fs';
import { NextConfig } from 'next';
import type webpack from 'webpack';

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: process.env.NEXT_PUBLIC_TEST_ENV === 'e2e',
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  publicRuntimeConfig: {
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'apadana.app' },
      {
        protocol: 'https',
        hostname: '**.githubusercontent.com',
        pathname: '**',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'apadana-uploads.s3.us-east-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: `${process.env.NEXT_PUBLIC_S3_UPLOAD_BUCKET}.s3.amazonaws.com`,
      },
      {
        protocol: 'https',
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

  webpack(config: webpack.Configuration) {
    // Grab the existing rule that handles SVG imports
    const fileLoaderRule: webpack.RuleSetRule | undefined =
      config.module?.rules?.find(
        (rule) =>
          typeof rule === 'object' &&
          rule != null &&
          'test' in rule &&
          rule.test != null &&
          rule.test instanceof RegExp &&
          rule.test?.test?.('.svg'),
      ) as webpack.RuleSetRule | undefined;

    config?.module?.rules?.push(
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
    if (fileLoaderRule != null) {
      fileLoaderRule.exclude = /\.svg$/i;
    }

    return config;
  },

  // Add HTTPS server configuration
  server: {
    https:
      process.env.NODE_ENV === 'development'
        ? {
            key: readFileSync(process.env.HTTPS_KEY_FILE || ''),
            cert: readFileSync(process.env.HTTPS_CERT_FILE || ''),
          }
        : undefined,
    hostname: process.env.HOST,
  },
};

module.exports = nextConfig;
