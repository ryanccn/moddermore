import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';

import { getSpecificList } from '~/lib/supabase';
import type { RichModList } from '~/lib/extra.types';

import { getInfo as getModrinthInfo } from '~/lib/modrinth';
import { getInfo as getCurseForgeInfo } from '~/lib/curseforge';
import { providerFormat } from '~/lib/providerFormat';

import Image from 'next/future/image';
import { useRouter } from 'next/router';
import Spinner from '~/components/Spinner';

interface Props {
  data: RichModList;
}

const ListPage: NextPage<Props> = ({ data }) => {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div className="min-w-screen grid min-h-screen place-items-center">
        <div className="flex flex-col items-center space-y-1">
          <Spinner className="mb-4" />
          <h2 className="text-lg font-medium">Fetching data...</h2>
          <h3 className="text-zinc-800 dark:text-zinc-200">
            (this only happens once)
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="layout">
      <h1 className="title">{data.title}</h1>
      <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {data.mods.map((mod) => (
          <li key={mod.id}>
            <a
              className="group flex space-x-4 rounded-sm bg-transparent p-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
              href={mod.href}
            >
              {mod.iconUrl && (
                <Image
                  width={64}
                  height={64}
                  src={mod.iconUrl}
                  alt={`Icon of ${mod.name}`}
                  className="h-[64px] w-[64px] rounded-md opacity-80 transition-opacity group-hover:opacity-100"
                />
              )}
              <div className="flex flex-col space-y-1">
                <h2 className="text-xl font-semibold">{mod.name}</h2>
                {mod.description && (
                  <h3 className="text-sm text-zinc-800 dark:text-zinc-200">
                    {mod.description.length > 25
                      ? mod.description.substring(0, 24) + '...'
                      : mod.description}
                  </h3>
                )}
                <h3 className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  {providerFormat(mod.provider)}
                </h3>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  if (!params || typeof params.id !== 'string') throw new Error('bruh');

  const data = await getSpecificList(params.id);
  if (!data) {
    console.error('not found', data);
    return { notFound: true, revalidate: 15 };
  }

  let newData: RichModList = {
    id: params.id,
    created_at: data.created_at,
    title: data.title,
    gameVersion: data.gameVersion,
    modloader: data.modloader,
    mods: [],
  };

  for (const boringMod of data.mods) {
    if (boringMod.provider === 'modrinth') {
      const info = await getModrinthInfo(boringMod.id);
      if (info) newData.mods.push(info);
    } else if (boringMod.provider === 'curseforge') {
      const info = await getCurseForgeInfo(boringMod.id);
      if (info) newData.mods.push(info);
    }
  }

  return { props: { data: newData }, revalidate: 30 };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: true };
};

export default ListPage;
