import type { NextPage } from 'next';
import Head from 'next/head';

const Whoops: NextPage = () => {
  return (
    <div className="min-w-screen grid min-h-screen place-items-center px-4">
      <Head>
        <title>Whoops</title>
      </Head>
      <div className="flex max-w-prose flex-col items-center space-y-4 text-center">
        <h1 className="text-2xl font-semibold">
          Moddermore is temporarily unavailable.
        </h1>
        <h2 className="text-lg font-medium">
          Moddermore has reached the fair use limits of Vercel, and we are
          actively trying to resolve the issue. Thank you for your patience.
        </h2>
      </div>
    </div>
  );
};

export default Whoops;
