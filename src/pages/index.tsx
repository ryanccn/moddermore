import type { GetStaticProps, NextPage } from 'next';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

import { twMerge } from 'tailwind-merge';

import Link from 'next/link';
import { GlobalLayout } from '~/components/layout/GlobalLayout';
import { RichModDisplay } from '~/components/partials/RichModDisplay';
import { buttonVariants } from '~/components/ui/Button';

import { ModrinthIcon, TutanotaIcon, VercelIcon } from '~/components/icons';
import {
  ArrowDownIcon,
  CloudIcon,
  FolderArchiveIcon,
  HexagonIcon,
  PlusIcon,
} from 'lucide-react';

import { getLists, getPageviews, getUsers } from '~/lib/stats';
import { numberFormat } from '~/lib/strings';

interface PageProps {
  pageviews: number | null;
  users: number;
  lists: number;
}

const Home: NextPage<PageProps> = ({ pageviews, users, lists }) => {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') router.push('/lists');
  }, [status, router]);

  return (
    <GlobalLayout
      title="Moddermore"
      titleSuffix={false}
      displayTitle={false}
      wideLayout
    >
      <div className="mb-14 flex min-h-screen flex-col justify-center p-6 lg:px-20">
        <div className="mb-20 flex flex-col">
          <h2 className="mb-10 text-6xl font-extrabold tracking-tight">
            Share the mods you use with{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text font-extrabold text-transparent">
              anyone
            </span>
          </h2>
          <h3 className="max-w-prose text-3xl font-medium text-neutral-700 dark:text-neutral-300">
            Modpacks, but without the hassle.
          </h3>
        </div>

        <Link
          href="/new"
          className={twMerge(
            buttonVariants({
              className:
                'mb-16 self-start px-6 py-4 text-xl shadow-xl shadow-indigo-500/30',
            }),
          )}
        >
          <PlusIcon className="block h-8 w-8" />
          <span>Create a new list</span>
        </Link>

        <ArrowDownIcon className="block h-5 w-5 stroke-2 text-neutral-600 dark:text-neutral-400" />
      </div>

      <div className="mb-12 flex flex-col items-center gap-x-24 gap-y-16 self-start p-6 lg:flex-row lg:px-20">
        {pageviews && (
          <div className="flex flex-col items-start gap-y-2">
            <span className="text-xl font-bold">Monthly pageviews</span>
            <span className="text-6xl font-black">
              {numberFormat(pageviews)}
            </span>
          </div>
        )}
        <div className="flex flex-col items-start gap-y-2">
          <span className="text-xl font-bold">Active users</span>
          <span className="text-6xl font-black">{numberFormat(users)}</span>
        </div>
        <div className="flex flex-col items-start gap-y-2">
          <span className="text-xl font-bold">Lists created</span>
          <span className="text-6xl font-black">{numberFormat(lists)}</span>
        </div>
      </div>

      <div className="mb-10 flex flex-col items-start gap-y-4 p-6 lg:px-20">
        <h2 className="text-4xl font-bold">Import from many platforms</h2>
        <h3 className="mb-6 text-2xl font-medium text-neutral-600 dark:text-neutral-400">
          All of your mods, but in the same place.
        </h3>
        <div className="flex flex-col gap-6 lg:flex-row">
          <RichModDisplay
            data={{
              name: 'Sodium',
              provider: 'modrinth',
              href: 'https://modrinth.com/mod/sodium',
              id: 'AANobbMI',
              description:
                'Modern rendering engine and client-side optimization mod for Minecraft',
              downloads: 795_496,
              iconUrl: 'https://cdn.modrinth.com/data/AANobbMI/icon.png',
            }}
            className="lg:w-1/2"
          />
          <RichModDisplay
            data={{
              name: "Xaero's Minimap",
              provider: 'curseforge',
              href: 'https://www.curseforge.com/minecraft/mc-mods/xaeros-minimap',
              id: '263420',
              description:
                "Displays the nearby world terrain, players, mobs, entities in the corner of your screen. Lets you create waypoints which help you find the locations you've marked.",
              downloads: 48_426_867,
              iconUrl:
                'https://media.forgecdn.net/avatars/thumbnails/92/854/256/256/636258666554688823.png',
            }}
            className="lg:w-1/2"
          />
        </div>
      </div>

      <div className="mb-10 flex flex-col items-start gap-y-4 p-6 lg:px-20">
        <h2 className="text-4xl font-bold">Share with your friends</h2>
        <h3 className="mb-6 text-2xl font-medium text-neutral-600 dark:text-neutral-400">
          Or just publish the link publicly anywhere you want!
        </h3>
      </div>

      <div className="mb-24 mt-24 flex flex-col items-start gap-y-4 p-6 lg:px-20">
        <h2 className="text-4xl font-bold">Export to anywhere</h2>
        <h3 className="mb-6 text-2xl font-medium text-neutral-600 dark:text-neutral-400">
          Publishing to Modrinth? Importing to Prism Launcher? We{"'"}ve got you
          covered.
        </h3>
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className={buttonVariants({ size: 'showcase' })}>
            <FolderArchiveIcon className="block h-5 w-5" />
            <span>ZIP archive</span>
          </div>
          <div
            className={buttonVariants({
              size: 'showcase',
              variant: 'modrinth',
            })}
          >
            <ModrinthIcon className="block h-5 w-5" />
            <span>Modrinth pack</span>
          </div>
          <div className={buttonVariants({ size: 'showcase', variant: 'sky' })}>
            <CloudIcon className="block h-5 w-5" />
            <span>packwiz</span>
          </div>
          <div
            className={buttonVariants({ size: 'showcase', variant: 'fuchsia' })}
          >
            <HexagonIcon className="block h-5 w-5" />
            <span>MultiMC / Prism</span>
          </div>
        </div>
      </div>

      <div className="mb-24 flex flex-col gap-y-16 p-6 lg:px-20">
        <h2 className="text-4xl font-bold">Our sponsors</h2>

        <div className="flex flex-col gap-24 lg:flex-row">
          <div className="flex flex-col gap-y-6">
            <h3 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200">
              Email
            </h3>
            <a href="https://tutanota.com/">
              <TutanotaIcon className="block w-60 fill-black dark:fill-white" />
            </a>
          </div>
          <div className="flex flex-col gap-y-6">
            <h3 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200">
              Hosting
            </h3>
            <a href="https://vercel.com/?utm_source=moddermore&utm_campaign=oss">
              <VercelIcon className="block w-60 fill-black dark:fill-white" />
            </a>
          </div>
        </div>
      </div>
    </GlobalLayout>
  );
};

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  return {
    props: {
      pageviews: await getPageviews(),
      users: await getUsers(),
      lists: await getLists(),
    },
    revalidate: 5 * 60,
  };
};

export default Home;
