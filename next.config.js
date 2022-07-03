/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { domains: ['cdn.modrinth.com', 'media.forgecdn.net'] },
};

module.exports = nextConfig;
