import type { GetStaticProps, NextPage } from "next";

import { twMerge } from "tailwind-merge";

import Link from "next/link";
import { useEffect, useState } from "react";

import { GlobalLayout } from "~/components/layout/GlobalLayout";
import { RichModDisplay } from "~/components/partials/RichModDisplay";
import { buttonVariants } from "~/components/ui/Button";
import { Select } from "~/components/ui/Select";

import {
  CloudIcon,
  FolderArchiveIcon,
  GlobeIcon,
  HexagonIcon,
  LockIcon,
  PlusIcon,
  ShieldIcon,
} from "lucide-react";
import { ModrinthIcon, TutanotaIcon, VercelIcon } from "~/components/icons";

import { getSpecificList } from "~/lib/db";
import { getLists, getPageviews, getUsers } from "~/lib/stats";

import { numberFormat } from "~/lib/utils/strings";
import type { ListVisibility, ModListWithExtraData } from "~/types/moddermore";
import { ModListInList } from "~/components/partials/ModListInList";

interface PageProps {
  pageviews: number | null;
  users: number;
  lists: number;
  featuredLists: ModListWithExtraData[];
}

const Home: NextPage<PageProps> = ({ pageviews, users, lists, featuredLists }) => {
  const [mockVisibility, setMockVisibility] = useState<ListVisibility>("private");

  useEffect(() => {
    const intvl = setInterval(() => {
      setMockVisibility(
        mockVisibility === "private" ? "unlisted" : mockVisibility === "unlisted" ? "public" : "private",
      );
    }, 2500);

    return () => {
      clearInterval(intvl);
    };
  });

  return (
    <GlobalLayout title="Moddermore" titleSuffix={false} displayTitle={false} wideLayout>
      <div className="mb-14 flex min-h-screen flex-col items-center justify-center p-6 lg:px-20">
        <div className="mb-16 flex flex-col items-center">
          <h2 className="mb-8 font-display text-6xl font-bold tracking-tight">
            Share the mods you use with{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text font-extrabold text-transparent">
              anyone
            </span>
          </h2>
          <p className="max-w-prose text-3xl font-light text-neutral-600 dark:text-neutral-400">
            Modpacks, but without the hassle.
          </p>
        </div>

        <Link
          href="/new"
          className={twMerge(
            buttonVariants({
              className: "mb-16 px-6 py-4 text-xl shadow-xl shadow-indigo-500/30",
            }),
          )}
        >
          <PlusIcon className="block h-8 w-8" />
          <span>Create a new list</span>
        </Link>
      </div>

      <div className="mb-20 grid w-full grid-cols-1 gap-5 self-start p-8 lg:grid-cols-3 lg:px-20">
        {pageviews && (
          <div className="flex flex-col items-start gap-y-4 rounded-lg bg-neutral-100 p-8 dark:bg-neutral-800">
            <span className="mb-16 font-display text-xl font-semibold text-neutral-600 dark:text-neutral-400">
              Monthly pageviews
            </span>
            <span className="text-6xl font-bold tracking-tight">{numberFormat(pageviews)}</span>
          </div>
        )}
        <div className="flex flex-col items-start gap-y-4 rounded-lg bg-neutral-100 p-8 dark:bg-neutral-800">
          <span className="mb-16 font-display text-xl font-semibold text-neutral-600 dark:text-neutral-400">
            Active users
          </span>
          <span className="text-6xl font-bold tracking-tight">{numberFormat(users)}</span>
        </div>
        <div className="flex flex-col items-start gap-y-4 rounded-lg bg-neutral-100 p-8 dark:bg-neutral-800">
          <span className="mb-16 font-display text-xl font-semibold text-neutral-600 dark:text-neutral-400">
            Lists created
          </span>
          <span className="text-6xl font-bold tracking-tight">{numberFormat(lists)}</span>
        </div>
      </div>

      <div className="mb-24 flex flex-col items-start gap-y-4 p-6 lg:px-20">
        <h2 className="font-display text-4xl font-bold">Mods from many providers</h2>
        <h3 className="mb-6 font-display text-2xl font-medium text-neutral-600 dark:text-neutral-400">
          All of your mods, but in the same place.
        </h3>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <RichModDisplay
            data={{
              name: "Sodium",
              provider: "modrinth",
              href: "https://modrinth.com/mod/sodium",
              id: "AANobbMI",
              description: "Modern rendering engine and client-side optimization mod for Minecraft",
              downloads: 4_327_347,
              iconUrl: "https://cdn.modrinth.com/data/AANobbMI/icon.png",
            }}
          />
          <RichModDisplay
            data={{
              name: "Iris Shaders",
              provider: "modrinth",
              href: "https://modrinth.com/mod/iris",
              id: "YL57xq9U",
              description:
                "A modern shaders mod for Minecraft intended to be compatible with existing OptiFine shader packs",
              downloads: 4_233_333,
              iconUrl: "https://cdn.modrinth.com/data/YL57xq9U/icon.png",
            }}
          />
          <RichModDisplay
            data={{
              name: "Xaero's Minimap",
              provider: "curseforge",
              href: "https://www.curseforge.com/minecraft/mc-mods/xaeros-minimap",
              id: "263420",
              description:
                "Displays the nearby world terrain, players, mobs, entities in the corner of your screen. Lets you create waypoints which help you find the locations you've marked.",
              downloads: 67_922_854,
              iconUrl: "https://media.forgecdn.net/avatars/thumbnails/92/854/256/256/636258666554688823.png",
            }}
          />
          <RichModDisplay
            data={{
              name: "Continuity",
              provider: "modrinth",
              href: "https://modrinth.com/mod/continuity",
              id: "1IjD5062",
              description: "A Fabric mod that allows for efficient connected textures",
              downloads: 1_833_222,
              iconUrl: "https://cdn.modrinth.com/data/1IjD5062/icon.png",
            }}
          />
        </div>
      </div>

      <div className="mb-24 flex flex-col items-start gap-y-4 p-6 lg:px-20">
        <h2 className="font-display text-4xl font-bold">A town square for Minecraft modding</h2>
        <h3 className="mb-6 font-display text-2xl font-medium text-neutral-600 dark:text-neutral-400">
          Has it ever been easier to share what mods you use?
        </h3>

        <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
          {featuredLists.map((data) => (
            <ModListInList listWithExtra={data} key={data.id} />
          ))}
        </div>
      </div>

      <div className="mb-10 flex flex-col items-start gap-y-4 p-6 lg:px-20">
        <h2 className="font-display text-4xl font-bold">Share with your friends</h2>
        <h3 className="mb-6 font-display text-2xl font-medium text-neutral-600 dark:text-neutral-400">
          Or just publish the link publicly anywhere you want!
        </h3>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Select
            name="visibility"
            value={"private"}
            currentValue={mockVisibility}
            className="p-6 transition-colors"
          >
            <div className="flex flex-row items-center gap-x-2">
              <LockIcon className="block h-6 w-6 shrink-0 opacity-75" strokeWidth={2.5} />
              <span className="font-display text-xl font-medium">Private</span>
            </div>
            <span className="text-base opacity-60">
              Only accessible by you. Others visiting the link will see a 404.
            </span>
          </Select>
          <Select
            name="visibility"
            value={"unlisted"}
            currentValue={mockVisibility}
            className="p-6 transition-colors"
          >
            <div className="flex flex-row items-center gap-x-2">
              <ShieldIcon className="block h-6 w-6 shrink-0 opacity-75" strokeWidth={2.5} />
              <span className="font-display text-xl font-medium">Unlisted</span>
            </div>
            <span className="text-base opacity-60">
              Anyone with the link will be able to see the list, and it should not be indexed by search
              engines.
            </span>
          </Select>
          <Select
            name="visibility"
            value={"public"}
            currentValue={mockVisibility}
            className="p-6 transition-colors"
          >
            <div className="flex flex-row items-center gap-x-2">
              <GlobeIcon className="block h-6 w-6 shrink-0 opacity-75" strokeWidth={2.5} />
              <span className="font-display text-xl font-medium">Public</span>
            </div>
            <span className="text-base opacity-60">
              Anyone with the link will be able to see the list, and it will be available both in Search and
              to search engines.
            </span>
          </Select>
        </div>
      </div>

      <div className="mb-24 mt-16 flex flex-col items-start gap-y-4 p-6 lg:px-20">
        <h2 className="font-display text-4xl font-bold">Export to anywhere</h2>
        <h3 className="mb-6 font-display text-2xl font-medium text-neutral-600 dark:text-neutral-400">
          Publishing to Modrinth? Importing to Prism Launcher? We{"'"}ve got you covered.
        </h3>
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className={buttonVariants({ size: "showcase" })}>
            <FolderArchiveIcon className="block h-5 w-5" />
            <span>ZIP archive</span>
          </div>
          <div
            className={buttonVariants({
              size: "showcase",
              variant: "modrinth",
            })}
          >
            <ModrinthIcon className="block h-5 w-5" />
            <span>Modrinth pack</span>
          </div>
          <div className={buttonVariants({ size: "showcase", variant: "sky" })}>
            <CloudIcon className="block h-5 w-5" />
            <span>packwiz</span>
          </div>
          <div className={buttonVariants({ size: "showcase", variant: "fuchsia" })}>
            <HexagonIcon className="block h-5 w-5" />
            <span>MultiMC / Prism</span>
          </div>
        </div>
      </div>

      <div className="mb-24 flex flex-col gap-y-10 p-6 lg:px-20">
        <h2 className="font-display text-4xl font-bold">Our sponsors</h2>

        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="flex flex-col gap-y-4 rounded-lg bg-neutral-100 px-8 py-6 dark:bg-neutral-800">
            <h3 className="font-display text-lg font-medium text-neutral-800 dark:text-neutral-200">Email</h3>

            <a href="https://tuta.com/">
              <TutanotaIcon className="block h-8 fill-black dark:fill-white" />
            </a>
          </div>
          <div className="flex flex-col gap-y-4 rounded-lg bg-neutral-100 px-8 py-6 dark:bg-neutral-800">
            <h3 className="font-display text-lg font-medium text-neutral-800 dark:text-neutral-200">
              Hosting
            </h3>

            <a href="https://vercel.com/?utm_source=moddermore&utm_campaign=oss">
              <VercelIcon className="block h-8 fill-black dark:fill-white" />
            </a>
          </div>
        </div>
      </div>
    </GlobalLayout>
  );
};

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  if (process.env.NODE_ENV === "production") {
    const [pageviews, users, lists] = await Promise.all([getPageviews(), getUsers(), getLists()]);

    const featuredLists = await Promise.all(
      ["d0f38916a6", "Hh2Tx-uNMxoh", "280ca6ba55", "gfkbMOkQ9LKK"].map((id) => getSpecificList(id)),
    ).then((res) => res.filter((k) => k !== null));

    return {
      props: { pageviews, users, lists, featuredLists },
      revalidate: 5 * 60,
    };
  }

  return {
    props: {
      pageviews: 1_234_567_890,
      users: 1_200_000,
      lists: 1_400_000,
      featuredLists: [
        {
          title: "Demo 1",
          description: null,
          gameVersion: "1.20.2",
          modloader: "fabric",
          mods: [],
          id: "demo-1",
          owner: "",
          created_at: "2023-10-08T12:18:14.434Z",
          visibility: "public",
          likes: 123,
          ownerProfile: { name: "Demo", profilePicture: null, banned: null },
        },
        {
          title: "Demo 2",
          description: null,
          gameVersion: "1.20.2",
          modloader: "fabric",
          mods: [],
          id: "demo-2",
          owner: "",
          created_at: "2023-10-08T12:18:14.434Z",
          visibility: "public",
          likes: 456,
          ownerProfile: { name: "Demo", profilePicture: null, banned: null },
        },
        {
          title: "Demo 3",
          description: null,
          gameVersion: "1.20.2",
          modloader: "fabric",
          mods: [],
          id: "demo-3",
          owner: "",
          created_at: "2023-10-08T12:18:14.434Z",
          visibility: "public",
          likes: 789,
          ownerProfile: { name: "Demo", profilePicture: null, banned: null },
        },
      ],
    },
    revalidate: 5 * 60,
  };
};

export default Home;
