import "~/styles/tailwind.css";
import "~/styles/radix.css";

import type { AppProps } from "next/app";

import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/next";

import NextNProgress from "nextjs-progressbar";
import { Toaster } from "react-hot-toast";

import { Inter } from "next/font/google";
import { AlertCircleIcon, CheckCircleIcon } from "lucide-react";

const inters = Inter({
  subsets: ["latin"],
});

function CustomApp({ Component, pageProps: { session, ...pageProps } }: AppProps<{ session: Session }>) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class">
        <NextNProgress color="#6366F1" />
        <div className={inters.className} style={{ display: "contents" }}>
          <Component {...pageProps} />
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              color: "var(--react-hot-toast-fg)",
              backgroundColor: "var(--react-hot-toast-bg)",
            },
            className: "react-hot-toast",
            success: {
              icon: <CheckCircleIcon className="block h-4 w-4 text-green-500 dark:text-green-400" />,
            },
            error: {
              icon: <AlertCircleIcon className="block h-4 w-4 text-red-400" />,
            },
          }}
        />
        <Analytics />
      </ThemeProvider>
    </SessionProvider>
  );
}

export default CustomApp;
