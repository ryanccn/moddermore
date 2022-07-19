import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';

import { getSpecificList } from '~/lib/supabase';
import type { RichModList } from '~/lib/extra.types';

import { getInfo as getModrinthInfo } from '~/lib/modrinth';
import { getInfo as getCurseForgeInfo } from '~/lib/curseforge';
import { modLoaderFormat, providerFormat } from '~/lib/strings';

import pLimit from 'p-limit';

import Head from 'next/head';
import Image from 'next/future/image';
import { useRouter } from 'next/router';

import FullLoadingScreen from '~/components/FullLoadingScreen';

interface Props {
  data: RichModList;
}

const ListPage: NextPage<Props> = ({ data }) => {
  const router = useRouter();

  if (router.isFallback) {
    return <FullLoadingScreen />;
  }

  return (
    <div className="layout">
      <Head>
        <title>{`${data.title} / Moddermore`}</title>
      </Head>

      <h1 className="title">{data.title}</h1>

      <div className="data-list">
        <p>
          For Minecraft <strong>{data.gameVersion}</strong> with{' '}
          <strong>{modLoaderFormat(data.modloader)}</strong>
        </p>
        <p>
          Created on <strong>{new Date(data.created_at).toDateString()}</strong>
        </p>
      </div>

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

  const lim = pLimit(4);

  await Promise.all(
    data.mods.map((boringMod) =>
      lim(async () => {
        if (boringMod.provider === 'modrinth') {
          const info = await getModrinthInfo(boringMod.id);
          if (info) newData.mods.push(info);
        } else if (boringMod.provider === 'curseforge') {
          const info = await getCurseForgeInfo(boringMod.id);
          if (info) newData.mods.push(info);
        }
      })
    )
  );

  newData.mods.sort((a, b) =>
    a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
  );

  return { props: { data: newData }, revalidate: 30 };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: true };
};

export default ListPage;
