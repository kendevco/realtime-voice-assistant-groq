/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    });

    return config;
  },
  env: {
    NEXT_PUBLIC_VOICE_FAST_MODEL: process.env.NEXT_PUBLIC_VOICE_FAST_MODEL,
  },
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
};

module.exports = nextConfig;