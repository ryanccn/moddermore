import '~/styles/tailwind.css';
import type { AppProps } from 'next/app';

import { LazyMotion, domAnimation } from 'framer-motion';
import PlausibleProvider from 'next-plausible';
import { UserProvider } from '@supabase/auth-helpers-react';
import { Toaster } from 'react-hot-toast';

import NextNProgress from 'nextjs-progressbar';
import { supabaseClient } from '@supabase/auth-helpers-nextjs';

import { useEffect } from 'react';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/outline';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    console.log(
      `%cModdermore%c${
        process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.substring(0, 8) ??
        'unknown'
      }`,
      'padding: 0.5rem 0.375rem 0.375rem 0.5rem; font-weight: bold; border-radius: 0.25rem 0 0 0.25rem; background-color: #6366F1; border: 1px solid transparent;',
      'padding: 0.5rem 0.375rem 0.375rem 0.5rem; font-weight: medium; border-radius: 0 0.25rem 0.25rem 0; background-color: transparent; border: 1px solid #6366F1;'
    );
  }, []);

  return (
    <PlausibleProvider domain="moddermore.vercel.app">
      <UserProvider supabaseClient={supabaseClient}>
        <LazyMotion features={domAnimation} strict>
          <NextNProgress color="#6366F1" />
          <Component {...pageProps} />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                color: 'var(--react-hot-toast-fg)',
                backgroundColor: 'var(--react-hot-toast-bg)',
              },
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
        </LazyMotion>
      </UserProvider>
    </PlausibleProvider>
  );
}

export default MyApp;
