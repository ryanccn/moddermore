import '~/styles/tailwind.css';
import type { AppProps } from 'next/app';

import { LazyMotion, domAnimation } from 'framer-motion';
import PlausibleProvider from 'next-plausible';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <PlausibleProvider domain="moddermore.vercel.app">
      <LazyMotion features={domAnimation} strict>
        <Component {...pageProps} />
      </LazyMotion>
    </PlausibleProvider>
  );
}

export default MyApp;
