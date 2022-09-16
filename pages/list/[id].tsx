import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';

import type { RichMod, RichModList } from '~/types/moddermore';

import { getSpecificList, modToRichMod } from '~/lib/db';
import { loaderFormat } from '~/lib/strings';

import pLimit from 'p-limit';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

import { GlobalLayout } from '~/components/layout/GlobalLayout';
import { Modalistic } from '~/components/Modalistic';
import { FullLoadingScreen } from '~/components/FullLoadingScreen';
import { RichModDisplay } from '~/components/partials/RichModDisplay';
import { ProgressOverlay } from '~/components/ProgressOverlay';
import { ModrinthIcon } from '~/components/icons';
import {
  FolderDownloadIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/outline';
import toast from 'react-hot-toast';

interface Props {
  data: RichModList;
}

const ListPage: NextPage<Props> = ({ data }) => {
  const router = useRouter();
  const session = useSession();

  const [status, setStatus] = useState<
    'idle' | 'resolving' | 'downloading' | 'result' | 'loadinglibraries'
  >('idle');
  const [progress, setProgress] = useState({ value: 0, max: 0 });
  const [result, setResult] = useState<{ success: string[]; failed: string[] }>(
    { success: [], failed: [] }
  );

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
    setResult({ success: [], failed: [] });
    setStatus('downloading');

    const zipfile = new JSZip();
    const modFolder = zipfile.folder('mods');

    if (!modFolder) {
      throw new Error('f');
    }

    const lim = pLimit(6);

    await Promise.all(
      urls.map((downloadData) =>
        lim(async () => {
          if ('error' in downloadData) {
            setResult((a) => ({
              ...a,
              failed: [
                ...a.failed,
                `${downloadData.name} ${downloadData.error}`,
              ],
            }));
            return;
          }

          const fileContents = await fetch(downloadData.url).then((r) => {
            if (!r.ok) {
              return null;
            }

            return r.blob();
          });

          if (!fileContents) {
            setResult((a) => ({
              ...a,
              failed: [
                ...a.failed,
                `${downloadData.name} network request failed`,
              ],
            }));
            return;
          }

          modFolder.file(downloadData.name, fileContents);

          if (downloadData.type === 'direct') {
            setProgress((old) => ({
              value: old.value + 1,
              max: old.max,
            }));
          }

          setResult((a) => ({
            ...a,
            success: [...a.success, downloadData.name],
          }));
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

  const deleteOMG = async () => {
    if (!session.data) return;

    const a = await fetch('/api/delete?id=' + data.id);
    if (a.ok) {
      toast.success(`Deleted ${data.title} (${data.id})!`);
    } else {
      toast.error(`Failed to delete ${data.title} (${data.id})!`);
    }
    router.push('/dashboard');
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
          Created on <strong>{new Date(data.created_at).toDateString()}</strong>{' '}
          by <strong>{data.owner ?? 'unknown'}</strong>
        </p>
      </div>

      <div className="mb-6 flex space-x-4">
        <button className="primaryish-button" onClick={downloadExport}>
          <FolderDownloadIcon className="block h-5 w-5" />
          <span>Export</span>
        </button>
        <button
          className="primaryish-button modrinth-themed"
          onClick={modrinthExport}
        >
          <ModrinthIcon className="block h-5 w-5" />
          <span>Modrinth pack</span>
        </button>
        {session && session.data?.user?.email === data.owner && (
          <>
            <button
              className="primaryish-button"
              onClick={() => {
                router.push(`/edit/${router.query.id}`);
              }}
            >
              <PencilIcon className="block h-5 w-5" />
              <span>Edit</span>
            </button>
            <button
              className="primaryish-button  bg-red-500"
              onClick={deleteOMG}
            >
              <TrashIcon className="block h-5 w-5" />
              <span>Delete</span>
            </button>
          </>
        )}
      </div>

      <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {data.mods.map((mod) => (
          <li className="block" key={mod.id}>
            <RichModDisplay data={mod} />
          </li>
        ))}
      </ul>

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

      {showModal && (
        <Modalistic
          className="flex flex-col space-y-4"
          backdropClickHandler={() => {
            setStatus('idle');
          }}
        >
          <div className="results-list">
            <details>
              <summary className="text-green-400">
                {result.success.length} successful downloads
              </summary>
              <ul>
                {result.success.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </details>

            <details>
              <summary className="text-red-400">
                {result.failed.length} failed
              </summary>
              <ul>
                {result.failed.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </details>
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
    </GlobalLayout>
  );
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  if (!params || !params.id || typeof params.id !== 'string')
    throw new Error('invalid parameter');

  let data = await getSpecificList(params.id);

  for (let _ = 1; _ <= 5; _++) {
    if (data !== null) break;
    console.warn(`retry ${_} to getSpecificList`);
    data = await getSpecificList(params.id);
  }

  if (!data) {
    console.error('not found');
    return { notFound: true, revalidate: 1 };
  }

  const newData: RichModList = {
    id: params.id,
    created_at: data.created_at,
    title: data.title,
    gameVersion: data.gameVersion,
    modloader: data.modloader,
    owner: data.owner,
    mods: [],
  };

  const lim = pLimit(6);
  newData.mods = await Promise.all(
    data.mods.map((a) => lim(() => modToRichMod(a)))
  ).then((a) => a.filter((b) => b !== null) as RichMod[]);

  newData.mods = newData.mods.sort((a, b) =>
    a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
  );

  return { props: { data: newData }, revalidate: 30 };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: true };
};

export default ListPage;
