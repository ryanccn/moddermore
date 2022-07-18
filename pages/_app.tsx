import '~/styles/tailwind.css';
import type { AppProps } from 'next/app';

import PlausibleProvider from 'next-plausible';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <PlausibleProvider domain="moddermore.vercel.app">
      <Component {...pageProps} />
    </PlausibleProvider>
  );
}

export default MyApp;
