import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://fonts.bunny.net" />
        <link
          href="https://fonts.bunny.net/css?family=lobster:400"
          rel="stylesheet"
        />
        <meta
          name="google-site-verification"
          content="gAuvmm-r_a-HDIw51Wb2tUWvBMM6MxOdpSVunn2bECY"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
