import { PlusCircleIcon } from '@heroicons/react/20/solid';
import type { NextPage } from 'next';

import Link from 'next/link';

import { GlobalLayout } from '~/components/layout/GlobalLayout';
// import { Navbar } from '~/components/layout/Navbar';

const Home: NextPage = () => {
  return (
    <GlobalLayout
      title="Moddermore"
      titleSuffix={false}
      displayTitle={false}
      isLandingPage
    >
      <div className="min-w-screen relative mb-16 flex min-h-screen flex-col items-center px-12 text-center">
        <div className="mb-20 flex flex-col">
          <h2 className="mb-10 text-6xl font-bold">
            Share the mods you use with{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text font-extrabold text-transparent">
              anyone
            </span>
          </h2>
          <h3 className="max-w-prose text-2xl font-medium">
            Include mods from both Modrinth and CurseForge. Import either
            manually, from Ferium, or from a folder of mod files. Export lists
            to zips or Modrinth modpacks.
          </h3>
        </div>

        <Link href="/new">
          <a className="primaryish-button px-6 py-4 text-xl">
            <PlusCircleIcon className="block h-8 w-8" />
            <span>Create a new list</span>
          </a>
        </Link>
      </div>
    </GlobalLayout>
  );
};

export default Home;
