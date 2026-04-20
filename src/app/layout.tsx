import "~/styles/tailwind.css";

import type { Metadata } from "next";
import { Outfit } from "next/font/google";

import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/authOptions";

import { Providers } from "./providers";

const outfit = Outfit({
  subsets: ["latin"],
  weight: "variable",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://moddermore.net"),
  title: {
    default: "Moddermore",
    template: "%s / Moddermore",
  },
  description: "Share your mods with anyone.",
  icons: {
    icon: [
      { url: "/icons/moddermore-positive.png" },
      { url: "/icons/moddermore-mono-white.svg", media: "(prefers-color-scheme: dark)" },
    ],
    apple: "/icons/moddermore-negative.png",
  },
  appleWebApp: {
    title: "Moddermore",
  },
  verification: {
    google: "gAuvmm-r_a-HDIw51Wb2tUWvBMM6MxOdpSVunn2bECY",
  },
  openGraph: {
    type: "website",
    title: {
      default: "Moddermore",
      template: "%s / Moddermore",
    },
    description: "Share your mods with anyone.",
    images: "/cover.png",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@RyanCaoDev",
    images: "/cover.png",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={outfit.className}>
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
