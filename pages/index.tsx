import type { NextPage } from 'next';
import Head from 'next/head';

const Home: NextPage = () => {
  return (
    <div className="min-w-screen grid min-h-screen place-items-center px-4">
      <Head>
        <title>Moddermore is in closed beta!</title>
      </Head>
      <div className="flex max-w-prose flex-col items-center space-y-4 text-center">
        <p className="text-xl font-semibold">
          This website is currently in closed beta.
        </p>
        <p className="closed-beta-contact">
          Contact the author of this website at Twitter{' '}
          <a
            href="https://twitter.com/RyanCaoDev"
            target="_blank"
            rel="noreferrer noopener"
          >
            @RyanCaoDev
          </a>{' '}
          or Discord server{' '}
          <a
            href="https://discord.gg/hUANJjEfTK"
            target="_blank"
            rel="noreferrer noopener"
          >
            discord.gg/hUANJjEfTK
          </a>{' '}
          to get access.
        </p>
      </div>
    </div>
  );
};

export default Home;
