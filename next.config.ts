import { withPlausibleProxy } from "next-plausible";
import makeBundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

const withBundleAnalyzer = makeBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
});

const csp = `
  default-src 'self';
  script-src 'self' umami.ryanccn.dev 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src * blob: data:;
  child-src 'none' www.youtube-nocookie.com;
  media-src 'none';
  font-src 'self';
  connect-src *;
`;

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "off",
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

const nextConfig: NextConfig = withPlausibleProxy()(
  withBundleAnalyzer({
    reactStrictMode: true,
    images: {
      remotePatterns: [{ hostname: "cdn.modrinth.com" }, { hostname: "media.forgecdn.net" }],
    },

    experimental: {
      optimizePackageImports: ["lucide-react", "@tremor/react", "date-fns"],
    },

    // eslint-disable-next-line @typescript-eslint/require-await
    async headers() {
      return [
        ...(process.env.NODE_ENV === "production"
          ? [
              {
                source: "/:path*",
                headers: securityHeaders,
              },
            ]
          : []),

        ...[
          "/(lists|likes|account|new)",
          "/new/(.*)",
          "/auth/(.*)",
          "/api/(.*)",
          "/list/:id/analytics",
          "/list/:id/settings",
        ].map((source) => ({
          source,
          headers: [
            {
              key: "x-robots-tag",
              value: "noindex",
            },
          ],
        })),
      ];
    },

    // eslint-disable-next-line @typescript-eslint/require-await
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

    // eslint-disable-next-line @typescript-eslint/require-await
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

export default nextConfig;
