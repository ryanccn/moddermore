import "~/styles/tailwind.css";
import "~/styles/radix.css";

import type { AppProps } from "next/app";

import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { Toaster } from "~/components/shadcn/sonner";

import { Outfit } from "next/font/google";

const inters = Outfit({
  subsets: ["latin"],
  weight: "variable",
});

function CustomApp({ Component, pageProps: { session, ...pageProps } }: AppProps<{ session: Session }>) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class">
        <div className={inters.className} style={{ display: "contents" }}>
          <Component {...pageProps} />
        </div>
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </ThemeProvider>
    </SessionProvider>
  );
}

export default CustomApp;
