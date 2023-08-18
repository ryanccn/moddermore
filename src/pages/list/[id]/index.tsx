/* eslint-disable @next/next/no-img-element */

import type { GetServerSideProps, NextPage } from 'next';

import type {
  ModListCreate,
  ModListWithExtraData,
  RichMod,
} from '~/types/moddermore';

import { richModToMod } from '~/lib/db/conversions';
import { getInfos as getModrinthInfos } from '~/lib/metadata/modrinth';
import { getInfos as getCurseForgeInfos } from '~/lib/metadata/curseforge';
import { loaderFormat } from '~/lib/strings';

import pLimit from 'p-limit';
import {
  FormEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/router';

import { getServerSession } from 'next-auth';
import { authOptions } from '~/lib/authOptions';
import { signIn, useSession } from 'next-auth/react';

import * as Dialog from '@radix-ui/react-dialog';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import Markdown from 'react-markdown';

import Link from 'next/link';
import Head from 'next/head';

import { GlobalLayout } from '~/components/layout/GlobalLayout';
import { RichModDisplay } from '~/components/partials/RichModDisplay';
import { ProgressOverlay } from '~/components/ProgressOverlay';
import { DonationMessage } from '~/components/partials/DonationMessage';
import { Spinner } from '~/components/partials/Spinner';
import { Button, buttonVariants } from '~/components/ui/Button';

import { MarkdownIcon, ModrinthIcon } from '~/components/icons';
import {
  ClipboardIcon,
  CloudIcon,
  CodeIcon,
  CopyIcon,
  DownloadIcon,
  EditIcon,
  FolderArchiveIcon,
  HeartIcon,
  HexagonIcon,
  SaveIcon,
  SettingsIcon,
  TrashIcon,
} from 'lucide-react';

import toast from 'react-hot-toast';
import { twMerge } from 'tailwind-merge';

import { getSpecificList } from '~/lib/db';
import type JSZip from 'jszip';
import { search } from '~/lib/import/search';
import type { ExportReturnData } from '~/lib/export/types';

interface PageProps {
  data: ModListWithExtraData;
}

const ListPage: NextPage<PageProps> = ({ data }) => {
  const router = useRouter();
  const session = useSession();

  const [resolvedMods, setResolvedMods] = useState<RichMod[] | null>(null);
  const [oldMods, setOldMods] = useState<RichMod[] | null>(null);

  const [status, setStatus] = useState<
    | 'idle'
    | 'resolving'
    | 'downloading'
    | 'result'
    | 'loadinglibraries'
    | 'generatingzip'
    | 'modrinth.form'
  >('idle');

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const [searchProvider, setSearchProvider] = useState('modrinth');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RichMod[]>([]);

  const [hasLiked, setHasLiked] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmDeleteTimeoutID, setConfirmDeleteTimeoutID] = useState<
    number | null
  >(null);

  const [mrpackName, setMrpackName] = useState(data.title);
  const [mrpackVersion, setMrpackVersion] = useState('0.0.1');
  const [mrpackCurseForgeStrategy, setMrpackCurseForgeStrategy] =
    useState('skip');

  const [progress, setProgress] = useState({ value: 0, max: 0 });
  const [result, setResult] = useState<{ success: string[]; failed: string[] }>(
    { success: [], failed: [] },
  );

  useEffect(() => {
    (async () => {
      const [modrinthMods, curseForgeMods] = await Promise.all([
        getModrinthInfos(
          data.mods.filter((k) => k.provider === 'modrinth').map((k) => k.id),
        ),
        getCurseForgeInfos(
          data.mods.filter((k) => k.provider === 'curseforge').map((k) => k.id),
        ),
      ]);

      if (modrinthMods === null)
        throw new Error('Failed to resolve Modrinth mods');

      const mods = [...modrinthMods, ...curseForgeMods]
        .filter((k) => k !== null)
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .sort((a, b) => (a!.name > b!.name ? 1 : -1));

      setResolvedMods(mods as RichMod[]);
      setOldMods(mods as RichMod[]);
    })().catch((error) => {
      console.error(error);
      toast.error('Failed to resolve mods');
    });
  }, [data]);

  useEffect(() => {
    if (session.status !== 'authenticated') return;

    fetch(`/api/likes/status?id=${data.id}`).then(async (r) => {
      if (!r.ok) {
        toast.error('Error fetching like status');
        return;
      }

      const { data: hasLikedRemote } = (await r.json()) as { data: boolean };
      setHasLiked(hasLikedRemote);
    });
  }, [data.id, session.status]);

  const showModal = useMemo(() => status === 'result', [status]);

  const downloadExport = useCallback(async () => {
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
      setProgress,
    );

    setProgress({ value: 0, max: data.mods.length });
    setResult({ success: [], failed: [] });
    setStatus('downloading');

    const zipfile = new JSZip();

    await exportZip(zipfile, urls);

    const zipBlob = await zipfile.generateAsync({ type: 'blob' });
    saveAs(zipBlob, `${data.title}.zip`);

    setStatus('result');
  }, [resolvedMods, data]);

  const exportZip = async (zipfile: JSZip, urls: ExportReturnData) => {
    const modFolder = zipfile.folder('mods');

    if (!modFolder) {
      throw new Error('f');
    }

    const lim = pLimit(8);

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
              : downloadData.url,
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
        }),
      ),
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
      setProgress,
    );

    const mrpack = await generateModrinthPack(
      { ...data, mods: resolvedMods },
      urls,
      {
        name: mrpackName,
        version: mrpackVersion,
        cfStrategy: mrpackCurseForgeStrategy,
      },
    );
    saveAs(mrpack, `${data.title}.mrpack`);

    setStatus('idle');
  };

  const packwizExport = async () => {
    try {
      await navigator.clipboard.writeText(getPackwizUrl(document));
      toast.success('Copied link to clipboard');
    } catch {
      toast.error('Failed to copy link to clipboard');
    }
  };

  const getPackwizUrl = (document: Document) => {
    const url = new URL(document.URL);
    url.pathname = `/list/${data.id}/packwiz/pack.toml`;
    return url.href;
  };

  const prismExport = async () => {
    setProgress({ value: 0, max: 3 });
    setStatus('loadinglibraries');

    const { default: JSZip } = await import('jszip');
    setProgress({ value: 1, max: 3 });
    const { default: saveAs } = await import('file-saver');
    setProgress({ value: 2, max: 3 });
    const { getLatestFabric, getLatestForge, getLatestQuilt } = await import(
      '~/lib/export/loaderVersions'
    );
    setProgress({ value: 3, max: 3 });

    setProgress({ value: 0, max: 2 });
    setStatus('generatingzip');

    const zipfile = new JSZip();
    zipfile.file(
      'instance.cfg',
      `
InstanceType=OneSix
OverrideCommands=true
PreLaunchCommand="$INST_JAVA" -jar packwiz-installer-bootstrap.jar ${getPackwizUrl(
        document,
      )}
name=${data.title}
`.trim(),
    );
    const meta = await fetch(
      `https://meta.prismlauncher.org/v1/net.minecraft/${data.gameVersion}.json`,
    );
    if (!meta.ok) {
      throw new Error('failed to fetch meta for minecraft');
    }
    const parsed = await meta.json();
    const mmcPack = {
      components: [
        {
          dependencyOnly: true,
          uid: parsed.requires[0].uid,
          version: parsed.requires[0].suggests,
        },
        {
          uid: 'net.minecraft',
          version: data.gameVersion,
        },
      ],
      formatVersion: 1,
    };
    if (data.modloader == 'fabric' || data.modloader == 'quilt') {
      mmcPack.components.push({
        dependencyOnly: true,
        uid: 'net.fabricmc.intermediary',
        version: data.gameVersion,
      });
    }
    switch (data.modloader) {
      case 'fabric': {
        mmcPack.components.push({
          uid: 'net.fabricmc.fabric-loader',
          version: await getLatestFabric(),
        });
        break;
      }
      case 'forge': {
        mmcPack.components.push({
          uid: 'net.minecraftforge',
          version: await getLatestForge(data.gameVersion),
        });
        break;
      }
      case 'quilt': {
        mmcPack.components.push({
          uid: 'org.quiltmc.quilt-loader',
          version: await getLatestQuilt(),
        });
        break;
      }
    }
    zipfile.file('mmc-pack.json', JSON.stringify(mmcPack));
    setProgress({ value: 1, max: 2 });
    const dotMinecraftFolder = zipfile.folder('.minecraft');

    if (!dotMinecraftFolder) {
      throw new Error('failed to create .minecraft folder in zipfile?');
    }

    const packwizInstallerBootstrapJar = await fetch(
      '/packwiz-installer-bootstrap.jar',
    );
    if (!packwizInstallerBootstrapJar.ok) {
      throw new Error('Failed to download packwiz-installer-bootstrap.jar');
    }

    dotMinecraftFolder.file(
      'packwiz-installer-bootstrap.jar',
      packwizInstallerBootstrapJar.blob(),
    );
    setProgress({ value: 2, max: 2 });

    const zipBlob = await zipfile.generateAsync({ type: 'blob' });
    saveAs(zipBlob, `${data.title}.zip`);

    setStatus('idle');
  };

  const prismStaticExport = async () => {
    if (!resolvedMods) return;

    setProgress({ value: 0, max: 4 });
    setStatus('loadinglibraries');

    const { getDownloadURLs } = await import('~/lib/export');
    setProgress({ value: 1, max: 4 });
    const { default: JSZip } = await import('jszip');
    setProgress({ value: 2, max: 4 });
    const { default: saveAs } = await import('file-saver');
    setProgress({ value: 3, max: 4 });
    const { getLatestFabric, getLatestForge, getLatestQuilt } = await import(
      '~/lib/export/loaderVersions'
    );
    setProgress({ value: 4, max: 4 });

    setProgress({ value: 0, max: data.mods.length });
    setStatus('resolving');

    const urls = await getDownloadURLs(
      { ...data, mods: resolvedMods },
      setProgress,
    );

    setProgress({ value: 0, max: data.mods.length });
    setResult({ success: [], failed: [] });
    setStatus('downloading');

    const zipfile = new JSZip();
    const dotMinecraftFolder = zipfile.folder('.minecraft');

    if (!dotMinecraftFolder) {
      throw new Error('failed to create .minecraft folder in zipfile?');
    }

    zipfile.file('instance.cfg', `name=${data.title}`);

    await Promise.all([
      exportZip(dotMinecraftFolder, urls),
      (async () => {
        const meta = await fetch(
          `https://meta.prismlauncher.org/v1/net.minecraft/${data.gameVersion}.json`,
        );
        if (!meta.ok) {
          throw new Error('failed to fetch meta for minecraft');
        }
        const parsed = await meta.json();
        const mmcPack = {
          components: [
            {
              dependencyOnly: true,
              uid: parsed.requires[0].uid,
              version: parsed.requires[0].suggests,
            },
            {
              uid: 'net.minecraft',
              version: data.gameVersion,
            },
          ],
          formatVersion: 1,
        };
        if (data.modloader == 'fabric' || data.modloader == 'quilt') {
          mmcPack.components.push({
            dependencyOnly: true,
            uid: 'net.fabricmc.intermediary',
            version: data.gameVersion,
          });
        }
        switch (data.modloader) {
          case 'fabric': {
            mmcPack.components.push({
              uid: 'net.fabricmc.fabric-loader',
              version: await getLatestFabric(),
            });
            break;
          }
          case 'forge': {
            mmcPack.components.push({
              uid: 'net.minecraftforge',
              version: await getLatestForge(data.gameVersion),
            });
            break;
          }
          case 'quilt': {
            mmcPack.components.push({
              uid: 'org.quiltmc.quilt-loader',
              version: await getLatestQuilt(),
            });
            break;
          }
        }
        zipfile.file('mmc-pack.json', JSON.stringify(mmcPack));
      })(),
    ]);

    const zipBlob = await zipfile.generateAsync({ type: 'blob' });
    saveAs(zipBlob, `${data.title}.zip`);

    setStatus('result');
  };

  const submitHandle: FormEventHandler = useCallback(
    async (e) => {
      e.preventDefault();
      if (!session.data || !resolvedMods || !oldMods) return;

      setIsSaving(true);

      const res = await fetch(
        `/api/list/${encodeURIComponent(data.id)}/update`,
        {
          method: 'POST',
          body: JSON.stringify({
            title: data.title,
            mods: resolvedMods.map((elem) => richModToMod(elem)),
            gameVersion: data.gameVersion,
            modloader: data.modloader,
          }),
          headers: { 'Content-Type': 'application/json' },
        },
      );

      if (!res.ok) {
        toast.error('Failed to update mods!');
        setIsSaving(false);
        setIsEditing(false);
        return;
      }

      const removedMods = oldMods.filter(
        (oldMod) =>
          !resolvedMods.some(
            (k) => k.id === oldMod.id && k.provider === oldMod.provider,
          ),
      );
      const addedMods = resolvedMods.filter(
        (resolvedMod) =>
          !oldMods.some(
            (k) =>
              k.id === resolvedMod.id && k.provider === resolvedMod.provider,
          ),
      );

      const changelog = `
## Added mods

${
  addedMods.length > 0
    ? addedMods
        .map((k) => `- [${k.name}](${k.href}) - ${k.description}`)
        .join('\n')
    : '*None*'
}

## Removed mods

${
  removedMods.length > 0
    ? removedMods
        .map((k) => `- [${k.name}](${k.href}) - ${k.description}`)
        .join('\n')
    : '*None*'
}
      `.trim();

      toast.success(
        <div className="flex flex-col gap-y-1">
          <span>List updated!</span>
          <button
            className="text-xs font-semibold text-blue-500 transition-colors hover:text-blue-500 dark:text-blue-300 dark:hover:text-blue-200"
            onClick={() => {
              navigator.clipboard.writeText(changelog);
            }}
          >
            Copy changelog
          </button>
        </div>,
        { duration: 5000 },
      );

      setIsSaving(false);
      setIsEditing(false);
      setOldMods(resolvedMods);
    },
    [session, resolvedMods, oldMods, data],
  );

  const updateSearch = useCallback(() => {
    search({
      platform: searchProvider as 'modrinth' | 'curseforge',
      query: searchQuery,
      loader: data.modloader,
      gameVersion: data.gameVersion,
    }).then((res) => {
      setSearchResults(res);
    });
  }, [searchProvider, searchQuery, data]);

  const copyMarkdownList = useCallback(() => {
    if (!resolvedMods) return;

    const text = resolvedMods
      .map((k) => `- [**${k.name}**](${k.href}) - ${k.description}`)
      .join('\n');

    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied Markdown to clipboard!');
    });
  }, [resolvedMods]);

  const copyJSON = useCallback(() => {
    navigator.clipboard
      .writeText(
        JSON.stringify({
          title: data.title,
          modloader: data.modloader,
          gameVersion: data.gameVersion,
          mods: data.mods,
        }),
      )
      .then(() => {
        toast.success('Copied JSON to clipboard!');
      });
  }, [data]);

  const toggleLikeStatus = useCallback(() => {
    if (session.status !== 'authenticated') {
      signIn();
      return;
    }

    setIsLiking(true);

    if (hasLiked) {
      fetch(`/api/likes/dislike?id=${data.id}`).then((r) => {
        if (r.ok) {
          setHasLiked(false);
          setIsLiking(false);
        }
      });
    } else {
      fetch(`/api/likes/like?id=${data.id}`).then((r) => {
        if (r.ok) {
          setHasLiked(true);
          setIsLiking(false);
        }
      });
    }
  }, [session, data.id, hasLiked]);

  const duplicateList = useCallback(() => {
    if (session.status !== 'authenticated') {
      signIn();
      return;
    }

    setIsDuplicating(true);

    fetch('/api/list/create', {
      method: 'POST',
      body: JSON.stringify({
        title: `${data.title} (copy)`,
        description: data.description ?? undefined,
        gameVersion: data.gameVersion,
        modloader: data.modloader,
        mods: data.mods,
      } satisfies ModListCreate),
      headers: { 'Content-Type': 'application/json' },
    })
      .then(async (res) => {
        if (!res.ok) return;
        const { id } = (await res.json()) as { id: string };
        router.push(`/list/${id}`);
        toast.success('Duplicated list!');
      })
      .catch(() => {
        toast.error('Failed to duplicate list!');
      })
      .finally(() => {
        setIsDuplicating(false);
      });
  }, [data, session, router]);

  const deleteCurrentList = useCallback(async () => {
    if (!data || !session.data) return;

    if (!confirmDelete) {
      setConfirmDelete(true);
      setConfirmDeleteTimeoutID(
        window.setTimeout(() => {
          setConfirmDelete(false);
        }, 3000),
      );
      return;
    }

    if (confirmDeleteTimeoutID) window.clearTimeout(confirmDeleteTimeoutID);

    const res = await fetch(`/api/list/${data.id}/delete`);
    if (res.ok) {
      toast.success(`Deleted ${data.title} (${data.id})!`);
    } else {
      toast.error(`Failed to delete ${data.title} (${data.id})!`);
    }
    router.push('/lists');
  }, [
    router,
    data,
    session,
    confirmDelete,
    confirmDeleteTimeoutID,
    setConfirmDelete,
    setConfirmDeleteTimeoutID,
  ]);

  return (
    <GlobalLayout title={data.title}>
      {data.description && (
        <div className="-mt-6 text-lg font-medium mb-8">
          <Markdown
            skipHtml
            disallowedElements={['h1', 'h2', 'h3', 'h4', 'h5', 'h6']}
          >
            {data.description}
          </Markdown>
        </div>
      )}

      <div className="data-list">
        <p>
          For Minecraft <strong>{data.gameVersion}</strong> with{' '}
          <strong>{loaderFormat(data.modloader)}</strong>
        </p>
        <p>
          Last updated on{' '}
          <strong>{new Date(data.created_at).toDateString()}</strong>
        </p>
        <p>
          <strong>{data.likes}</strong> {data.likes === 1 ? 'like' : 'likes'}
        </p>
      </div>

      {data.ownerProfile && (
        <div className="mt-6 flex flex-row items-center gap-x-3 mb-8">
          {data.ownerProfile.profilePicture ? (
            <img
              src={data.ownerProfile.profilePicture}
              width={32}
              height={32}
              className="rounded-full"
              alt=""
            />
          ) : (
            <div className="h-[32px] w-[32px] rounded-full bg-neutral-100 dark:bg-neutral-700" />
          )}

          <strong className="font-semibold">{data.ownerProfile.name}</strong>
        </div>
      )}

      <div className="mb-16 flex flex-wrap gap-2">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild disabled={!resolvedMods}>
            <Button>
              <DownloadIcon className="block h-5 w-5" />
              <span>Export as...</span>
            </Button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="start"
              className="radix-dropdown-menu-content"
            >
              <DropdownMenu.Item asChild>
                <button
                  className="radix-dropdown-button"
                  onClick={downloadExport}
                  disabled={data.mods.length === 0}
                >
                  <FolderArchiveIcon className="block h-5 w-5" />
                  <span>Zip archive</span>
                </button>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <button
                  className="radix-dropdown-button"
                  onClick={modrinthExportInit}
                  disabled={data.mods.length === 0}
                >
                  <ModrinthIcon className="block h-5 w-5" />
                  <span>Modrinth pack</span>
                </button>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <button
                  className="radix-dropdown-button"
                  onClick={packwizExport}
                  disabled={
                    data.visibility === 'private' || data.mods.length === 0
                  }
                >
                  <CloudIcon className="block h-5 w-5" />
                  <span>Copy packwiz link</span>
                </button>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <button
                  className="radix-dropdown-button"
                  onClick={prismStaticExport}
                  disabled={data.mods.length === 0}
                >
                  <HexagonIcon className="block h-5 w-5" />
                  <span>MultiMC</span>
                </button>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <button
                  className="radix-dropdown-button"
                  onClick={prismExport}
                  disabled={
                    data.visibility === 'private' || data.mods.length === 0
                  }
                >
                  <div className="relative">
                    <HexagonIcon className="block h-5 w-5" />
                    <CloudIcon className="block h-3 w-3 fill-current absolute right-0 bottom-0" />
                  </div>
                  <span>MultiMC (auto-updating)</span>
                </button>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button disabled={!resolvedMods}>
              <ClipboardIcon className="block h-5 w-5" />
              <span>Copy as...</span>
            </Button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="start"
              className="radix-dropdown-menu-content z-40 mt-2 overflow-hidden rounded bg-neutral-50 shadow dark:bg-neutral-800"
            >
              <DropdownMenu.Item asChild>
                <button
                  className="radix-dropdown-button"
                  onClick={copyMarkdownList}
                  disabled={data.mods.length === 0}
                >
                  <MarkdownIcon className="block h-5 w-5" />
                  <span>Markdown list</span>
                </button>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <button
                  className="radix-dropdown-button"
                  onClick={copyJSON}
                  disabled={data.mods.length === 0}
                >
                  <CodeIcon className="block h-5 w-5" />
                  <span>JSON</span>
                </button>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <Button onClick={toggleLikeStatus}>
          {!isLiking ? (
            <HeartIcon
              className={twMerge(
                'block h-5 w-5',
                hasLiked
                  ? 'fill-current stroke-none'
                  : 'fill-none stroke-current stroke-[1.5]',
              )}
            />
          ) : (
            <Spinner className="block h-5 w-5 fill-current" />
          )}
          <span>{!hasLiked ? 'Like' : 'Unlike'}</span>
        </Button>

        <Button onClick={duplicateList}>
          {isDuplicating ? (
            <Spinner className="block h-5 w-5 fill-current" />
          ) : (
            <CopyIcon className="block h-5 w-5" />
          )}
          <span>Duplicate</span>
        </Button>

        {session && session.data?.user.id === data.owner && (
          <>
            {!isEditing ? (
              <Button
                variant="secondary"
                onClick={() => {
                  setIsEditing(true);
                }}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Spinner className="block h-5 w-5 fill-current" />
                ) : (
                  <EditIcon className="block h-5 w-5" />
                )}
                <span>Edit</span>
              </Button>
            ) : (
              <Button
                variant="green"
                onClick={submitHandle}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Spinner className="block h-5 w-5" />
                ) : (
                  <SaveIcon className="block h-5 w-5" />
                )}
                <span>Save</span>
              </Button>
            )}

            <Link
              className={buttonVariants({ variant: 'secondary' })}
              href={`/list/${data.id}/settings`}
            >
              <SettingsIcon className="block h-5 w-5" />
              <span>Settings</span>
            </Link>

            <Button variant="danger" onClick={deleteCurrentList}>
              <TrashIcon className="block h-5 w-5" />
              {confirmDelete ? (
                <span>Confirm deletion?</span>
              ) : (
                <span>Delete</span>
              )}
            </Button>
          </>
        )}
      </div>

      {isEditing && (
        <div className="mb-10 flex w-full flex-col gap-y-4">
          <Head>
            <title>Editing {data.title}</title>
          </Head>

          <div className="mt-10 flex w-full items-center justify-start gap-x-2">
            <select
              name="searchProvider"
              value={searchProvider}
              className="mm-input flex-grow-0"
              aria-label="Select a provider to search from"
              onChange={(e) => {
                setSearchProvider(e.target.value);
              }}
            >
              <option value="modrinth">Modrinth</option>
              <option value="curseforge">CurseForge</option>
            </select>

            <input
              type="text"
              name="search-bar"
              className="mm-input flex-grow"
              placeholder="Search for mods"
              role="search"
              aria-label="Search for mods"
              minLength={1}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  updateSearch();
                }
              }}
            />

            <Button type="button" onClick={updateSearch}>
              Search
            </Button>
          </div>

          {resolvedMods && searchResults.length > 0 && (
            <ul className="flex flex-wrap gap-y-2">
              {searchResults.map((res) =>
                resolvedMods.some(
                  (m) => m.id === res.id && m.provider === res.provider,
                ) ? null : (
                  <li className="w-full" key={res.id}>
                    <RichModDisplay
                      data={res}
                      buttonType="add"
                      onClick={() => {
                        setResolvedMods([...resolvedMods, res]);
                      }}
                    />
                  </li>
                ),
              )}
            </ul>
          )}
        </div>
      )}

      <DonationMessage />

      <ul className="mt-8 flex flex-col gap-y-4">
        {resolvedMods ? (
          resolvedMods.map((mod) => (
            <li className="w-full" key={mod.id}>
              <RichModDisplay
                data={mod}
                buttonType={isEditing ? 'delete' : null}
                onClick={() => {
                  setResolvedMods(resolvedMods.filter((a) => a.id !== mod.id));
                }}
                parent={data}
              />
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
      ) : status === 'generatingzip' ? (
        <ProgressOverlay label="Getting the .zip file ready..." {...progress} />
      ) : null}

      <Dialog.Root
        open={status === 'modrinth.form'}
        onOpenChange={(open) => {
          if (!open) setStatus('idle');
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="dialog overlay" />
          <Dialog.Content
            className="dialog content"
            // onEscapeKeyDown={() => {
            //   setStatus('idle');
            // }}
            // onPointerDownOutside={() => {
            //   setStatus('idle');
            // }}
            // onInteractOutside={() => {
            //   setStatus('idle');
            // }}
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
                  className="mm-input"
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
                  className="mm-input"
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
                  className="mm-input"
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

              <Button variant="modrinth" type="submit" className="self-start">
                <ModrinthIcon className="block h-5 w-5" />
                <span>Start export</span>
              </Button>
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
            <div className="flex flex-col gap-y-4">
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

              <Button
                className="self-center"
                onClick={() => {
                  setStatus('idle');
                }}
              >
                Close
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </GlobalLayout>
  );
};

export const getServerSideProps: GetServerSideProps<
  PageProps | { notFound: true }
> = async ({ query, req, res }) => {
  if (typeof query.id !== 'string') throw new Error('?');
  const data = await getSpecificList(query.id);

  if (!data) {
    return {
      notFound: true,
    };
  }

  const sess = await getServerSession(req, res, authOptions);
  if (data.visibility === 'private' && sess?.user.id !== data.owner) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      data: { ...data },
    },
  };
};

export default ListPage;
