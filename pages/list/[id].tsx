import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';

import { getSpecificList } from '~/lib/supabase';
import type { RichModList } from '~/types/moddermore';

import { getInfo as getModrinthInfo } from '~/lib/metadata/modrinth';
import { getInfo as getCurseForgeInfo } from '~/lib/metadata/curseforge';
import { getDownloadURLs } from '~/lib/export';
import { loaderFormat } from '~/lib/strings';

import JSZip from 'jszip';
import { saveAs } from 'file-saver';

import pLimit from 'p-limit';
import { useState } from 'react';
import { useRouter } from 'next/router';

import GlobalLayout from '~/components/GlobalLayout';
import FullLoadingScreen from '~/components/FullLoadingScreen';
import CreateBanner from '~/components/CreateBanner';
import RichModDisplay from '~/components/RichModDisplay';
import ProgressOverlay from '~/components/ProgressOverlay';
import { FolderDownloadIcon } from '@heroicons/react/outline';
import ModrinthIcon from '~/components/ModrinthIcon';
import { generateModrinthPack } from '~/lib/export/mrpack';

interface Props {
  data: RichModList;
}

const ListPage: NextPage<Props> = ({ data }) => {
  const router = useRouter();

  const [status, setStatus] = useState<'idle' | 'resolving' | 'downloading'>(
    'idle'
  );
  const [progress, setProgress] = useState({ value: 0, max: 0 });

  const downloadExport = async () => {
    setProgress({ value: 0, max: data.mods.length });
    setStatus('resolving');

    const urls = await getDownloadURLs(data, setProgress);

    setStatus('downloading');
    setProgress({ value: 0, max: data.mods.length });

    const zipfile = new JSZip();
    const modFolder = zipfile.folder('mods');

    if (!modFolder) {
      throw new Error('f');
    }

    const lim = pLimit(4);

    await Promise.all(
      urls.map((downloadData) =>
        lim(async () => {
          if ('error' in downloadData) return;
          const fileContents = await fetch(downloadData.url).then((r) =>
            r.blob()
          );

          modFolder.file(downloadData.name, fileContents);

          if (downloadData.type === 'direct') {
            setProgress((old) => ({
              value: old.value + 1,
              max: old.max,
            }));
          }
        })
      )
    );

    const zipBlob = await zipfile.generateAsync({ type: 'blob' });
    saveAs(zipBlob, `${data.title}.zip`);

    setStatus('idle');
  };

  const modrinthExport = async () => {
    setProgress({ value: 0, max: data.mods.length });
    setStatus('resolving');

    const mrpack = await generateModrinthPack(
      data,
      await getDownloadURLs(data, setProgress)
    );
    saveAs(mrpack, `${data.title}.mrpack`);

    setStatus('idle');
  };

  if (router.isFallback) {
    return <FullLoadingScreen />;
  }

  return (
    <GlobalLayout title={data.title}>
      <div className="data-list">
        <p>
          For Minecraft <strong>{data.gameVersion}</strong> with{' '}
          <strong>{loaderFormat(data.modloader)}</strong>
        </p>
        <p>
          Created on <strong>{new Date(data.created_at).toDateString()}</strong>
        </p>
      </div>

      <div className="flex space-x-4">
        <button className="primaryish-button mb-16" onClick={downloadExport}>
          <FolderDownloadIcon className="block h-5 w-5" />
          <span>Export</span>
        </button>
        <button
          className="primaryish-button modrinth-themed mb-16"
          onClick={modrinthExport}
        >
          <ModrinthIcon className="block h-5 w-5" />
          <span>Modrinth pack</span>
        </button>
      </div>

      <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {data.mods.map((mod) => (
          <li className="block" key={mod.id}>
            <RichModDisplay data={mod} />
          </li>
        ))}
      </ul>

      <CreateBanner />

      {status !== 'idle' && (
        <ProgressOverlay
          label={
            status === 'downloading'
              ? 'Downloading mods...'
              : 'Resolving mods...'
          }
          {...progress}
        />
      )}
    </GlobalLayout>
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
