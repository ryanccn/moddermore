import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';

import { getSpecificList } from '~/lib/supabase';
import type { RichModList } from '~/types/moddermore';

import { getInfo as getModrinthInfo } from '~/lib/metadata/modrinth';
import { getInfo as getCurseForgeInfo } from '~/lib/metadata/curseforge';
import { loaderFormat } from '~/lib/strings';

import pLimit from 'p-limit';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { AnimatePresence } from 'framer-motion';

import GlobalLayout from '~/components/GlobalLayout';
import Modalistic from '~/components/Modalistic';
import FullLoadingScreen from '~/components/FullLoadingScreen';
import CreateBanner from '~/components/CreateBanner';
import RichModDisplay from '~/components/RichModDisplay';
import ProgressOverlay from '~/components/ProgressOverlay';
import ModrinthIcon from '~/components/ModrinthIcon';
import { FolderDownloadIcon } from '@heroicons/react/outline';

interface Props {
  data: RichModList;
}

const ListPage: NextPage<Props> = ({ data }) => {
  const router = useRouter();

  const [status, setStatus] = useState<
    'idle' | 'resolving' | 'downloading' | 'result' | 'loadinglibraries'
  >('idle');
  const [progress, setProgress] = useState({ value: 0, max: 0 });
  const [result, setResult] = useState({ success: 0, failed: 0 });

  const showModal = useMemo(() => status === 'result', [status]);

  const downloadExport = async () => {
    setProgress({ value: 0, max: 3 });
    setStatus('loadinglibraries');

    const { getDownloadURLs } = await import('~/lib/export');
    setProgress({ value: 1, max: 3 });
    const { default: JSZip } = await import('jszip');
    setProgress({ value: 2, max: 3 });
    const { default: saveAs } = await import('file-saver');
    setProgress({ value: 3, max: 3 });

    setProgress({ value: 0, max: data.mods.length });
    setStatus('resolving');

    const urls = await getDownloadURLs(data, setProgress);

    setProgress({ value: 0, max: data.mods.length });
    setResult({ success: 0, failed: 0 });
    setStatus('downloading');

    const zipfile = new JSZip();
    const modFolder = zipfile.folder('mods');

    if (!modFolder) {
      throw new Error('f');
    }

    const lim = pLimit(4);

    await Promise.all(
      urls.map((downloadData) =>
        lim(async () => {
          if ('error' in downloadData) {
            setResult((a) => ({ ...a, failed: a.failed + 1 }));
            return;
          }

          const fileContents = await fetch(downloadData.url).then((r) => {
            if (!r.ok) {
              return null;
            }

            return r.blob();
          });

          if (!fileContents) {
            setResult((a) => ({ ...a, failed: a.failed + 1 }));
            return;
          }

          modFolder.file(downloadData.name, fileContents);

          if (downloadData.type === 'direct') {
            setProgress((old) => ({
              value: old.value + 1,
              max: old.max,
            }));
          }

          setResult((a) => ({ ...a, success: a.success + 1 }));
        })
      )
    );

    const zipBlob = await zipfile.generateAsync({ type: 'blob' });
    saveAs(zipBlob, `${data.title}.zip`);

    setStatus('result');
  };

  const modrinthExport = async () => {
    setProgress({ value: 0, max: 3 });
    setStatus('loadinglibraries');

    const { getDownloadURLs } = await import('~/lib/export');
    setProgress({ value: 1, max: 3 });
    const { generateModrinthPack } = await import('~/lib/export/mrpack');
    setProgress({ value: 2, max: 3 });
    const { default: saveAs } = await import('file-saver');
    setProgress({ value: 3, max: 3 });

    setStatus('resolving');
    setProgress({ value: 0, max: data.mods.length });

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

      {status === 'resolving' ? (
        <ProgressOverlay label="Resolving mods..." {...progress} />
      ) : status === 'downloading' ? (
        <ProgressOverlay label="Downloading mods..." {...progress} />
      ) : status === 'loadinglibraries' ? (
        <ProgressOverlay
          label="Loading supplementary libraries..."
          {...progress}
        />
      ) : null}

      <AnimatePresence>
        {showModal && (
          <Modalistic
            backdropClickHandler={() => {
              setStatus('idle');
            }}
          >
            <div className="flex flex-col items-center space-y-2">
              <p className="text-lg font-medium text-green-400">
                {result.success} successful downloads
              </p>
              <p className="text-lg font-medium text-red-400">
                {result.failed} failed
              </p>
            </div>
            <button
              className="primaryish-button self-center"
              onClick={() => {
                setStatus('idle');
              }}
            >
              Close
            </button>
          </Modalistic>
        )}
      </AnimatePresence>
    </GlobalLayout>
  );
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  if (!params || !params.id || typeof params.id !== 'string')
    throw new Error('invalid parameter');

  const data = await getSpecificList(params.id);

  if (!data) {
    console.error('not found');
    return { notFound: true, revalidate: 1 };
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
