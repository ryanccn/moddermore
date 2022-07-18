const { withPlausibleProxy } = require('next-plausible');

/** @type {import('next').NextConfig} */
const nextConfig = withPlausibleProxy()({
  reactStrictMode: true,
  images: { domains: ['cdn.modrinth.com', 'media.forgecdn.net'] },
  experimental: {
    images: {
      allowFutureImage: true,
    },
  },
});

module.exports = nextConfig;
