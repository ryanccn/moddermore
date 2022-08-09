import { PlusCircleIcon } from '@heroicons/react/outline';
import type { NextPage } from 'next';

import Link from 'next/link';

import { GlobalLayout } from '~/components/layout/GlobalLayout';
import { Navbar } from '~/components/layout/Navbar';
import { WickedBackground } from '~/components/WickedBackground';

import { useCantHaveAuth } from '~/hooks/useRequireAuth';

const Home: NextPage = () => {
  useCantHaveAuth();

  return (
    <GlobalLayout
      title="Moddermore"
      titleSuffix={false}
      displayTitle={false}
      isLandingPage
    >
      <div className="min-w-screen relative mb-16 flex min-h-screen flex-col items-start px-12 text-white">
        <Navbar isLandingPage />

        <div className="mb-20 flex flex-col">
          <h2 className="mb-4 text-4xl font-bold">Moddermore</h2>
          <h2 className="mb-10 text-3xl font-semibold">
            Share the mods you use with anyone
          </h2>
          <h3 className="text-lg font-medium">
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

        <WickedBackground />
      </div>
    </GlobalLayout>
  );
};

export default Home;
