/* eslint-disable @typescript-eslint/no-var-requires */

const { withPlausibleProxy } = require('next-plausible');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
});

const csp = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' fonts.bunny.net 'unsafe-inline';
  img-src * blob: data:;
  child-src 'none';
  media-src 'none';
  font-src 'self' fonts.bunny.net;
  connect-src *;
`;

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
  {
    key: 'Content-Security-Policy',
    value: csp.replace(/\s{2,}/g, ' ').trim(),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = withPlausibleProxy()(
  withBundleAnalyzer({
    reactStrictMode: true,
    images: { domains: ['cdn.modrinth.com', 'media.forgecdn.net'] },

    async headers() {
      if (process.env.NODE_ENV === 'development') return [];

      return [
        {
          source: '/:path*',
          headers: securityHeaders,
        },
      ];
    },

    experimental: {
      fallbackNodePolyfills: false,
    },
  })
);

module.exports = nextConfig;
