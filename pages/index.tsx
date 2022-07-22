import { PlusCircleIcon } from '@heroicons/react/outline';
import type { NextPage } from 'next';

import Head from 'next/head';
import Link from 'next/link';

const Home: NextPage = () => {
  return (
    <div className="layout">
      <Head>
        <title>Moddermore</title>
      </Head>

      <div className="flex min-h-screen flex-col items-start">
        <div className="mb-40 flex flex-col space-y-3">
          <h2 className="text-4xl font-semibold">
            Share the mods you use with anyone!
          </h2>
          <h2 className="text-6xl font-bold">Moddermore</h2>
        </div>

        <Link href="/new">
          <a className="primaryish-button px-4 py-3 text-xl">
            <PlusCircleIcon className="block h-8 w-8" />
            <span>Create a new list</span>
          </a>
        </Link>
      </div>
    </div>
  );
};

export default Home;
