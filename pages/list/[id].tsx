import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';

import { getSpecificList } from '~/lib/supabase';
import type { RichModList } from '~/lib/extra.types';

import { getInfo as getModrinthInfo } from '~/lib/modrinth';
import { getInfo as getCurseForgeInfo } from '~/lib/curseforge';
import { providerFormat } from '~/lib/providerFormat';

import Image from 'next/image';

interface Props {
  data: RichModList;
}

const ListPage: NextPage<Props> = ({ data }) => {
  return (
    <div className="layout">
      <h1 className="text-2xl font-bold mb-10">{data.title}</h1>
      <ul className="grid grid-cols-2 gap-2">
        {data.mods.map((mod) => (
          <li key={mod.id}>
            <a
              className="flex space-x-4 p-4 bg-transparent hover:bg-gray-50 rounded-sm"
              href={mod.href}
            >
              {mod.iconUrl && (
                <div className="shrink-0">
                  <Image
                    layout="fixed"
                    width={64}
                    height={64}
                    src={mod.iconUrl}
                    alt={`Icon of ${mod.name}`}
                    className="rounded-md"
                  />
                </div>
              )}
              <div className="flex flex-col space-y-1">
                <h2 className="text-xl font-semibold">{mod.name}</h2>
                {mod.description && (
                  <h3 className="text-sm text-gray-800">
                    {mod.description.length > 25
                      ? mod.description.substring(0, 24) + '...'
                      : mod.description}
                  </h3>
                )}
                <h3 className="text-gray-600 text-xs font-medium">
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
    console.log('not found', data);
    return { notFound: true, revalidate: 15 };
  }

  let newData: RichModList = {
    id: params.id,
    created_at: data.created_at,
    title: data.title,
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
  return { paths: [], fallback: 'blocking' };
};

export default ListPage;
