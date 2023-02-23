import type { GetServerSideProps, NextPage } from 'next';

import type { ModList, RichMod } from '~/types/moddermore';

import { modToRichMod } from '~/lib/db/conversions';
import { loaderFormat } from '~/lib/strings';

import pLimit from 'p-limit';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

import * as Dialog from '@radix-ui/react-dialog';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

import { GlobalLayout } from '~/components/layout/GlobalLayout';
import { FullLoadingScreen } from '~/components/FullLoadingScreen';
import { RichModDisplay } from '~/components/partials/RichModDisplay';
import { LegacyBadge } from '~/components/partials/LegacyBadge';
import { ProgressOverlay } from '~/components/ProgressOverlay';

import { ModrinthIcon, PrismIcon } from '~/components/icons';
import {
  FolderArrowDownIcon,
  PencilIcon,
  TrashIcon,
  LinkIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/20/solid';

import toast from 'react-hot-toast';
import { getSpecificList } from '~/lib/db';
import { DonationMessage } from '~/components/partials/DonateMessage';
import type JSZip from 'jszip';
import { ExportReturnData } from '~/lib/export/types';

interface PageProps {
  data: ModList;
}

const ListPage: NextPage<PageProps> = ({ data }) => {
  const router = useRouter();
  const session = useSession();

  const [resolvedMods, setResolvedMods] = useState<RichMod[] | null>(null);

  const [status, setStatus] = useState<
    | 'idle'
    | 'resolving'
    | 'downloading'
    | 'result'
    | 'loadinglibraries'
    | 'modrinth.form'
  >('idle');

  const [mrpackName, setMrpackName] = useState(data.title);
  const [mrpackVersion, setMrpackVersion] = useState('0.0.1');
  const [mrpackCurseForgeStrategy, setMrpackCurseForgeStrategy] =
    useState('skip');
  const [progress, setProgress] = useState({ value: 0, max: 0 });
  const [result, setResult] = useState<{ success: string[]; failed: string[] }>(
    { success: [], failed: [] }
  );

  useEffect(() => {
    (async () => {
      const lim = pLimit(6);

      const mods = await Promise.all(
        data.mods.map((a) => lim(() => modToRichMod(a)))
      )
        .then((a) => a.filter((b) => b !== null) as RichMod[])
        .then((a) => a.sort((a, b) => (a.name > b.name ? 1 : -1)));

      setResolvedMods(mods);
    })().catch(() => {
      toast.error('Failed to resolve mods');
    });
  }, [data]);

  const showModal = useMemo(() => status === 'result', [status]);

  const downloadExport = async () => {
    if (!resolvedMods) return;

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

    const urls = await getDownloadURLs(
      { ...data, mods: resolvedMods },
      setProgress
    );

    setProgress({ value: 0, max: data.mods.length });
    setResult({ success: [], failed: [] });
    setStatus('downloading');

    const zipfile = new JSZip();

    await exportZip(zipfile, urls)

    const zipBlob = await zipfile.generateAsync({ type: 'blob' });
    saveAs(zipBlob, `${data.title}.zip`);

    setStatus('result');
  };

  const exportZip = async (zipfile: JSZip, urls: ExportReturnData) => {
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

          const fileContents = await fetch(
            downloadData.provider === 'curseforge'
              ? `/api/cursed?url=${encodeURIComponent(downloadData.url)}`
              : downloadData.url
          ).then((r) => {
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
  };

  const modrinthExportInit = () => {
    setStatus('modrinth.form');
  };

  const modrinthExport = async () => {
    if (!data || !resolvedMods) return;

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

    const urls = await getDownloadURLs(
      { ...data, mods: resolvedMods },
      setProgress
    );

    const mrpack = await generateModrinthPack(
      { ...data, mods: resolvedMods },
      urls,
      {
        name: mrpackName,
        version: mrpackVersion,
        cfStrategy: mrpackCurseForgeStrategy,
      }
    );
    saveAs(mrpack, `${data.title}.mrpack`);

    setStatus('idle');
  };

  const packwizExport = async () => {
    try {
      await navigator.clipboard.writeText(getPackwizUrl(document));
      toast.success("Copied link to clipboard");
    } catch {
      toast.error("Failed to copy link to clipboard");
    }
  };

  const getPackwizUrl = (document: Document) => {
    const url = new URL(document.URL);
    url.pathname = `/list/${data.id}/packwiz/pack.toml`;
    return url.href;
  };

  const prismStaticExport = async () => {
    if (!resolvedMods) return;

    setProgress({ value: 0, max: 3 });
    setStatus('loadinglibraries');

    const { getDownloadURLs } = await import('~/lib/export');
    setProgress({ value: 1, max: 4 });
    const { default: JSZip } = await import('jszip');
    setProgress({ value: 2, max: 4 });
    const { default: saveAs } = await import('file-saver');
    setProgress({ value: 3, max: 4 });
    const {
      getLatestFabric,
      getLatestForge,
      getLatestQuilt,
    } = await import('~/lib/export/loaderVersions');
    setProgress({ value: 4, max: 4 });

    setProgress({ value: 0, max: data.mods.length });
    setStatus('resolving');

    const urls = await getDownloadURLs(
      { ...data, mods: resolvedMods },
      setProgress
    );

    setProgress({ value: 0, max: data.mods.length });
    setResult({ success: [], failed: [] });
    setStatus('downloading');

    const zipfile = new JSZip();
    const dotMinecraftFolder = zipfile.folder('.minecraft');

    if (!dotMinecraftFolder) {
      throw new Error('failed to create .minecraft folder in zipfile?');
    }

    zipfile.file("instance.cfg", `name=${data.title}`);

    await Promise.all([
      exportZip(dotMinecraftFolder, urls),
      (async () => {
        const meta = await fetch(`https://meta.prismlauncher.org/v1/net.minecraft/${data.gameVersion}.json`);
        if (!meta.ok) {
          throw new Error('failed to fetch meta for minecraft');
        }
        const parsed = await meta.json();
        const mmcPack = {
          "components": [
              {
                  "dependencyOnly": true,
                  "uid": parsed.requires[0].uid,
                  "version": parsed.requires[0].suggests,
              },
              {
                  "uid": "net.minecraft",
                  "version": data.gameVersion,
              },
          ],
          "formatVersion": 1
        };
        if (data.modloader == "fabric" || data.modloader == "quilt") {
          mmcPack.components.push({
            "dependencyOnly": true,
            "uid": "net.fabricmc.intermediary",
            "version": data.gameVersion
          });
        }
        switch (data.modloader) {
          case "fabric":
            mmcPack.components.push({
              "uid": "net.fabricmc.fabric-loader",
              "version": await getLatestFabric(),
            });
            break;
          case "forge":
            mmcPack.components.push({
              "uid": "net.minecraftforge",
              "version": await getLatestForge(),
            });
            break;
          case "quilt":
            mmcPack.components.push({
              "uid": "org.quiltmc.quilt-loader",
              "version": await getLatestQuilt(),
            });
            break;
        }
        zipfile.file("mmc-pack.json", JSON.stringify(mmcPack))
      })()
    ]);

    const zipBlob = await zipfile.generateAsync({ type: 'blob' });
    saveAs(zipBlob, `${data.title}.zip`);

    setStatus('result');
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
    return <FullLoadingScreen />;
  }

  return (
    <GlobalLayout title={data.title}>
      {data.legacy && <LegacyBadge className="mb-4" />}
      <div className="data-list">
        <p>
          For Minecraft <strong>{data.gameVersion}</strong> with{' '}
          <strong>{loaderFormat(data.modloader)}</strong>
        </p>
        <p>
          Last updated on{' '}
          <strong>{new Date(data.created_at).toDateString()}</strong>
        </p>
      </div>

      <div className="mb-16 flex space-x-4">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className="primaryish-button"
              onClick={downloadExport}
              disabled={!data.mods.length}
            >
              <FolderArrowDownIcon className="block h-5 w-5" />
              <span>Export as...</span>
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content align="start" className="mt-1 rounded shadow">
              <DropdownMenu.Item asChild>
                <button
                  className="primaryish-button dropdown rounded-b-none"
                  onClick={downloadExport}
                  disabled={!data.mods.length}
                >
                  <ArchiveBoxIcon className="block h-5 w-5" />
                  <span>Zip archive</span>
                </button>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
              <button
                className="primaryish-button dropdown rounded-none"
                onClick={modrinthExportInit}
                disabled={!data.mods.length}
              >
                <ModrinthIcon className="block h-5 w-5" />
                <span>Modrinth pack</span>
              </button>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
              <button
                className="primaryish-button dropdown rounded-none"
                onClick={packwizExport}
                disabled={!data.mods.length}
              >
                <LinkIcon className="block h-5 w-5" />
                <span>Copy packwiz link</span>
              </button>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
              <button
                className="primaryish-button dropdown rounded-t-none"
                onClick={prismStaticExport}
                disabled={!data.mods.length}
              >
                <PrismIcon className="block h-5 w-5" />
                <span>MultiMC / Prism (static)</span>
              </button>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
        {session && session.data?.user.id === data.owner && (
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
              className="primaryish-button bg-red-500"
              onClick={deleteOMG}
            >
              <TrashIcon className="block h-5 w-5" />
              <span>Delete</span>
            </button>
          </>
        )}
      </div>

      <DonationMessage />

      <ul className="flex flex-col gap-y-3">
        {resolvedMods ? (
          resolvedMods.map((mod) => (
            <li className="w-full" key={mod.id}>
              <RichModDisplay data={mod} />
            </li>
          ))
        ) : (
          <>
            {data.mods.map(({ provider, id }) => (
              <li className="skeleton h-36" key={`${provider}-${id}`} />
            ))}
          </>
        )}
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

      <Dialog.Root open={status === 'modrinth.form'}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog overlay" />
          <Dialog.Content
            className="dialog content"
            onEscapeKeyDown={() => {
              setStatus('idle');
            }}
            onPointerDownOutside={() => {
              setStatus('idle');
            }}
            onInteractOutside={() => {
              setStatus('idle');
            }}
          >
            <form
              className="flex flex-col gap-y-8"
              onSubmit={(e) => {
                e.preventDefault();
                modrinthExport();
              }}
            >
              <label className="flex flex-col gap-y-1">
                <span className="text-sm font-medium">Name</span>
                <input
                  className="moddermore-input"
                  required
                  minLength={1}
                  value={mrpackName}
                  onChange={(e) => {
                    setMrpackName(e.target.value);
                  }}
                />
              </label>
              <label className="flex flex-col gap-y-1">
                <span className="text-sm font-medium">Version</span>

                <input
                  className="moddermore-input"
                  required
                  minLength={1}
                  value={mrpackVersion}
                  onChange={(e) => {
                    setMrpackVersion(e.target.value);
                  }}
                />
              </label>
              <label className="flex flex-col gap-y-1">
                <span className="text-sm font-medium">
                  CurseForge mod resolution strategy
                </span>
                <select
                  id="curseforge-strategy"
                  className="moddermore-input"
                  required
                  value={mrpackCurseForgeStrategy}
                  onChange={(e) => {
                    setMrpackCurseForgeStrategy(e.target.value);
                  }}
                >
                  <option value="embed">Embed files</option>
                  <option value="links">Include download links</option>
                  <option value="skip">Skip</option>
                </select>
              </label>
              {mrpackCurseForgeStrategy !== 'skip' && (
                <div className="rounded bg-yellow-100 p-4 font-semibold text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100">
                  {mrpackCurseForgeStrategy === 'embed'
                    ? 'Make sure you have the rights to embed these files in your modpack distribution!'
                    : 'This modpack will be ineligible for publication on Modrinth.'}
                </div>
              )}

              <button
                type="submit"
                className="primaryish-button modrinth-themed self-start"
              >
                <ModrinthIcon className="block h-5 w-5" />
                <span>Start export</span>
              </button>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root
        open={showModal}
        onOpenChange={(open) => {
          if (!open) setStatus('idle');
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="dialog overlay" />
          <Dialog.Content className="dialog content">
            <div className="flex flex-col space-y-4">
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
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </GlobalLayout>
  );
};

export const getServerSideProps: GetServerSideProps<
  PageProps | { notFound: true }
> = async ({ query }) => {
  if (typeof query.id !== 'string') throw new Error('?');
  const data = await getSpecificList(query.id);

  if (!data) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      data: { ...data, legacy: data.legacy ? 'redacted' : null },
    },
  };
};

export default ListPage;
