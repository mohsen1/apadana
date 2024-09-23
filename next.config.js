// eslint-disable-next-line @typescript-eslint/no-var-requires
const { z } = require('zod');

function validateEnvironmentVariable() {
  const schema = z.object({
    CLERK_SECRET_KEY: z.string(),
    GOOGLE_MAPS_API_KEY: z.string(),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
    UPLOADTHING_APP_ID: z.string(),
    UPLOADTHING_SECRET: z.string(),
    UPLOADTHING_TOKEN: z.string(),
    WEBHOOK_SECRET: z.string(),
    POSTGRES_DATABASE_URL: z.string().url(),
  });

  const result = schema.safeParse(process.env);

  if (!result.success) {
    throw new Error(
      `❌ Invalid environment variables: ${result.error.flatten().fieldErrors}`,
    );
  }
}

validateEnvironmentVariable();

/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: process.env.NEXT_E2E_BUILD === 'true',

  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: !!process.env.CI,
  },
  eslint: {
    ignoreDuringBuilds: !!process.env.CI,
    dirs: ['src'],
  },
  swcMinify: true,

  images: {
    domains: ['utfs.io', 'img.clerk.com'],
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
    const fileLoaderRule = config.module.rules.find((rule) =>
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
