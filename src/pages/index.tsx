import type { NextPage } from 'next';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

import { useRouter } from 'next/router';
import Link from 'next/link';

import { TutanotaIcon, VercelIcon } from '~/components/icons';
import { GlobalLayout } from '~/components/layout/GlobalLayout';

import { PlusCircleIcon } from '@heroicons/react/20/solid';
import { ArrowDownIcon } from '@heroicons/react/24/solid';

const Home: NextPage = () => {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') router.push('/dashboard');
  }, [status, router]);

  return (
    <GlobalLayout
      title="Moddermore"
      titleSuffix={false}
      displayTitle={false}
      isLandingPage
    >
      <div className="mb-20 flex flex-col items-center px-12 text-center">
        <div className="mb-20 flex flex-col items-center">
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

        <Link
          href="/new"
          className="primaryish-button mb-16 px-6 py-4 text-xl shadow-xl shadow-indigo-500/30"
        >
          <PlusCircleIcon className="block h-8 w-8" />
          <span>Create a new list</span>
        </Link>

        <ArrowDownIcon className="block h-5 w-5 stroke-2 text-zinc-600 dark:text-zinc-400" />
      </div>

      <div className="mb-36 flex flex-col items-center gap-y-16">
        <h2 className="text-4xl font-bold">Our sponsors</h2>
        <div className="flex flex-col gap-16 lg:flex-row">
          <div className="flex flex-col gap-y-6 transition hover:scale-105">
            <h3 className="text-2xl font-semibold">Email</h3>
            <a href="https://tutanota.com/">
              <TutanotaIcon className="block w-60 fill-black dark:fill-white" />
            </a>
          </div>
          <div className="flex flex-col gap-y-6 transition hover:scale-105">
            <h3 className="text-2xl font-semibold">Hosting</h3>
            <a href="https://vercel.com/?utm_source=moddermore&utm_campaign=oss">
              <VercelIcon className="block w-60 fill-black dark:fill-white" />
            </a>
          </div>
        </div>
      </div>
    </GlobalLayout>
  );
};

export default Home;
