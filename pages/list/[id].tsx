import type { NextPage } from 'next';

import type { ModList, RichMod, RichModList } from '~/types/moddermore';

import { modToRichMod } from '~/lib/db/conversions';
import { loaderFormat } from '~/lib/strings';

import pLimit from 'p-limit';
import { useEffect, useMemo, useState } from 'react';
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

const ListPage: NextPage = () => {
  const router = useRouter();
  const session = useSession();

  const [data, setData] = useState<RichModList | null>(null);
  const [initialLoadStatus, setInitialLoadStatus] = useState<
    [string, number, number]
  >(['Loading list', 0, 1]);

  const [status, setStatus] = useState<
    'idle' | 'resolving' | 'downloading' | 'result' | 'loadinglibraries'
  >('idle');
  const [progress, setProgress] = useState({ value: 0, max: 0 });
  const [result, setResult] = useState<{ success: string[]; failed: string[] }>(
    { success: [], failed: [] }
  );

  useEffect(() => {
    if (typeof router.query.id !== 'string') return;

    fetch('/api/get?id=' + router.query.id)
      .then((r) => r.json())
      .then(async (a: ModList) => {
        if (!a) {
          toast.error('An error occurred');
          router.push('/dashboard');
          return;
        }

        setInitialLoadStatus(['Resolving mods', 0, a.mods.length]);

        const lim = pLimit(6);
        const mods = await Promise.all(
          a.mods.map((a) =>
            lim(async () => {
              const richedMod = await modToRichMod(a);
              if (richedMod) {
                setInitialLoadStatus((a) => [a[0], a[1] + 1, a[2]]);
              }
              return richedMod;
            })
          )
        ).then((a) => a.filter((b) => b !== null) as RichMod[]);

        setData({ ...a, mods });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showModal = useMemo(() => status === 'result', [status]);

  const downloadExport = async () => {
    if (!data) return;

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
    if (!data) return;

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
    if (!data || !session.data) return;

    const a = await fetch('/api/delete?id=' + data.id);
    if (a.ok) {
      toast.success(`Deleted ${data.title} (${data.id})!`);
    } else {
      toast.error(`Failed to delete ${data.title} (${data.id})!`);
    }
    router.push('/dashboard');
  };

  if (!data) {
    return (
      <FullLoadingScreen
        label={`${initialLoadStatus[0]} ${initialLoadStatus[1]}/${initialLoadStatus[2]}`}
      />
    );
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

export default ListPage;
