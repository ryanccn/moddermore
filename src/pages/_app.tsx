import '~/styles/tailwind.css';
import '~/styles/radix.css';
import type { AppProps } from 'next/app';

import PlausibleProvider from 'next-plausible';
import { SessionProvider } from 'next-auth/react';

import { Toaster } from 'react-hot-toast';
import Script from 'next/script';
import NextNProgress from 'nextjs-progressbar';

import { useEffect } from 'react';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/20/solid';
import { Session } from 'next-auth';

function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<{ session: Session }>) {
  useEffect(() => {
    console.log(
      `%cModdermore%c${
        process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 8) ?? 'unknown'
      }`,
      'padding: 0.5rem 0.375rem 0.375rem 0.5rem; font-weight: bold; border-radius: 0.25rem 0 0 0.25rem; background-color: #6366F1; border: 1px solid transparent;',
      'padding: 0.5rem 0.375rem 0.375rem 0.5rem; font-weight: medium; border-radius: 0 0.25rem 0.25rem 0; background-color: transparent; border: 1px solid #6366F1;',
    );
  }, []);

  return (
    <PlausibleProvider domain="moddermore.net">
      <SessionProvider session={session}>
        <NextNProgress color="#6366F1" />
        <Script
          src="https://umami.ryanccn.dev/script.js"
          data-website-id="e38dabf4-89a9-43cf-88ff-eafd855851c6"
        />
        <Component {...pageProps} />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              color: 'var(--react-hot-toast-fg)',
              backgroundColor: 'var(--react-hot-toast-bg)',
            },
            className: 'react-hot-toast',
            success: {
              icon: (
                <CheckCircleIcon className="block h-5 w-5 text-green-400" />
              ),
            },
            error: {
              icon: (
                <ExclamationCircleIcon className="block h-5 w-5 text-red-400" />
              ),
            },
          }}
        />
      </SessionProvider>
    </PlausibleProvider>
  );
}

export default MyApp;
