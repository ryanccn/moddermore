/* eslint-disable unicorn/prefer-module */
/* eslint-disable @typescript-eslint/no-var-requires */

const { withPlausibleProxy } = require("next-plausible");

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
});

const csp = `
  default-src 'self';
  script-src 'self' umami.ryanccn.dev 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src * blob: data:;
  child-src 'none';
  media-src 'none';
  font-src 'self';
  connect-src *;
`;

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "origin-when-cross-origin",
  },
  {
    key: "Content-Security-Policy",
    value: csp.replaceAll(/\s{2,}/g, " ").trim(),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = withPlausibleProxy()(
  withBundleAnalyzer({
    reactStrictMode: true,
    images: { domains: ["cdn.modrinth.com", "media.forgecdn.net"] },

    async headers() {
      if (process.env.NODE_ENV === "development") return [];

      return [
        {
          source: "/:path*",
          headers: securityHeaders,
        },
      ];
    },

    async redirects() {
      return [
        {
          source: "/dashboard",
          destination: "/lists",
          permanent: false,
        },
        {
          source: "/new/polymc",
          destination: "/new/prism",
          permanent: true,
        },
        {
          source: "/blog/may-update",
          destination: "/changelog/2023-05-12-may-update",
          permanent: false,
        },
        {
          source: "/blog/search",
          destination: "/changelog/2023-08-18-search",
          permanent: false,
        },
        {
          source: "/blog/:match*",
          destination: "/changelog/:match*",
          permanent: false,
        },
      ];
    },

    async rewrites() {
      return [
        {
          source: "/list/:id/packwiz/:match*",
          destination: "/api/packwiz/list/:id/:match*",
        },
      ];
    },
  }),
);

module.exports = nextConfig;
