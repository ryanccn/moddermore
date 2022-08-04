import { PlusCircleIcon } from '@heroicons/react/outline';
import type { NextPage } from 'next';

import Link from 'next/link';

import GlobalLayout from '~/components/GlobalLayout';
import { useCantHaveAuth } from '~/hooks/useRequireAuth';

const Home: NextPage = () => {
  useCantHaveAuth();

  return (
    <GlobalLayout title="Moddermore" titleSuffix={false} displayTitle={false}>
      <div className="flex flex-col items-start">
        <div className="mb-32 flex flex-col">
          <h2 className="mb-4 text-4xl font-bold">Moddermore</h2>
          <h2 className="mb-10 text-3xl font-semibold">
            Share the mods you use with anyone
          </h2>
          <h3 className="text-lg font-medium">
            Moddermore supports mods from both Modrinth and CurseForge. You can
            import either manually, from Ferium, or from a folder of mod files.
            Exports are also available for download via ZIPs or .mrpacks (WIP).
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
