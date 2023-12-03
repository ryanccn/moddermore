import "~/styles/tailwind.css";
import "~/styles/satoshi.css";
import "~/styles/radix.css";
import type { AppProps } from "next/app";

import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import PlausibleProvider from "next-plausible";
import { ThemeProvider } from "next-themes";

import NextNProgress from "nextjs-progressbar";
import { Toaster } from "react-hot-toast";

import { AlertCircleIcon, CheckCircleIcon } from "lucide-react";

function CustomApp({ Component, pageProps: { session, ...pageProps } }: AppProps<{ session: Session }>) {
  return (
    <PlausibleProvider domain="moddermore.net" taggedEvents>
      <SessionProvider session={session}>
        <ThemeProvider attribute="class">
          <NextNProgress color="#386641" />
          <Component {...pageProps} />
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
        </ThemeProvider>
      </SessionProvider>
    </PlausibleProvider>
  );
}

export default CustomApp;
