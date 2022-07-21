import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';

import { getSpecificList } from '~/lib/supabase';
import type { RichModList } from '~/lib/extra.types';

import { getInfo as getModrinthInfo } from '~/lib/modrinth';
import { getInfo as getCurseForgeInfo } from '~/lib/curseforge';
import { loaderFormat } from '~/lib/strings';

import pLimit from 'p-limit';
import { useRouter } from 'next/router';

import Head from 'next/head';
import FullLoadingScreen from '~/components/FullLoadingScreen';
import CreateBanner from '~/components/CreateBanner';
import RichModDisplay from '~/components/RichModDisplay';
import BackLink from '~/components/BackLink';

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

      <BackLink href="/" />

      <h1 className="title">{data.title}</h1>

      <div className="data-list">
        <p>
          For Minecraft <strong>{data.gameVersion}</strong> with{' '}
          <strong>{loaderFormat(data.modloader)}</strong>
        </p>
        <p>
          Created on <strong>{new Date(data.created_at).toDateString()}</strong>
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {data.mods.map((mod) => (
          <li className="block" key={mod.id}>
            <RichModDisplay data={mod} />
          </li>
        ))}
      </ul>

      <CreateBanner />
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
