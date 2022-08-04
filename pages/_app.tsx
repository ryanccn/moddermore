import '~/styles/tailwind.css';
import type { AppProps } from 'next/app';

import { LazyMotion, domAnimation } from 'framer-motion';
import PlausibleProvider from 'next-plausible';

import NextNProgress from 'nextjs-progressbar';

import { UserProvider } from '@supabase/auth-helpers-react';
import { supabaseClient } from '@supabase/auth-helpers-nextjs';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    console.log(
      `%cModdermore%c${
        process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.substring(0, 6) ??
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
        </LazyMotion>
      </UserProvider>
    </PlausibleProvider>
  );
}

export default MyApp;
