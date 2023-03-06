/* eslint-disable @next/next/no-img-element */

import type { GetServerSideProps, NextPage } from 'next';

import type {
  ModListCreate,
  ModListWithOwnerData,
  RichMod,
} from '~/types/moddermore';

import { modToRichMod, richModToMod } from '~/lib/db/conversions';
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
import { signIn, useSession } from 'next-auth/react';

import * as Dialog from '@radix-ui/react-dialog';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

import Link from 'next/link';
import Head from 'next/head';

import { GlobalLayout } from '~/components/layout/GlobalLayout';
import { FullLoadingScreen } from '~/components/FullLoadingScreen';
import { RichModDisplay } from '~/components/partials/RichModDisplay';
import { LegacyBadge } from '~/components/partials/LegacyBadge';
import { ProBadge } from '~/components/partials/ProBadge';
import { ProgressOverlay } from '~/components/ProgressOverlay';

import { ModrinthIcon, PrismIcon } from '~/components/icons';
import {
  FolderArrowDownIcon,
  PencilIcon,
  TrashIcon,
  LinkIcon,
  ArchiveBoxIcon,
  RocketLaunchIcon,
  CogIcon,
  HeartIcon,
  Square2StackIcon,
} from '@heroicons/react/20/solid';

import toast from 'react-hot-toast';
import { getSpecificList } from '~/lib/db';
import type JSZip from 'jszip';

import { search } from '~/lib/import/search';
import type { ExportReturnData } from '~/lib/export/types';
import clsx from 'clsx';

interface PageProps {
  data: ModListWithOwnerData;
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
    | 'generatingzip'
    | 'modrinth.form'
  >('idle');

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchProvider, setSearchProvider] = useState('modrinth');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RichMod[]>([]);

  const [hasLiked, setHasLiked] = useState(false);

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

    await exportZip(zipfile, urls);

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
      toast.success('Copied link to clipboard');
    } catch {
      toast.error('Failed to copy link to clipboard');
    }
  };

  const getPackwizUrl = (document: Document) => {
    const url = new URL(document.URL);
    url.pathname = `/list/${data.customSlug ?? data.id}/packwiz/pack.toml`;
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
      `OverrideCommands=true
PreLaunchCommand="$INST_JAVA" -jar packwiz-installer-bootstrap.jar ${getPackwizUrl(
        document
      )}
name=${data.title}`
    );
    const meta = await fetch(
      `https://meta.prismlauncher.org/v1/net.minecraft/${data.gameVersion}.json`
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
      case 'fabric':
        mmcPack.components.push({
          uid: 'net.fabricmc.fabric-loader',
          version: await getLatestFabric(),
        });
        break;
      case 'forge':
        mmcPack.components.push({
          uid: 'net.minecraftforge',
          version: await getLatestForge(),
        });
        break;
      case 'quilt':
        mmcPack.components.push({
          uid: 'org.quiltmc.quilt-loader',
          version: await getLatestQuilt(),
        });
        break;
    }
    zipfile.file('mmc-pack.json', JSON.stringify(mmcPack));
    setProgress({ value: 1, max: 2 });
    const dotMinecraftFolder = zipfile.folder('.minecraft');

    if (!dotMinecraftFolder) {
      throw new Error('failed to create .minecraft folder in zipfile?');
    }

    const packwizInstallerBootstrapJar = await fetch(
      '/packwiz-installer-bootstrap.jar'
    );
    if (!packwizInstallerBootstrapJar.ok) {
      throw new Error('Failed to download packwiz-installer-bootstrap.jar');
    }

    dotMinecraftFolder.file(
      'packwiz-installer-bootstrap.jar',
      packwizInstallerBootstrapJar.blob()
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

    zipfile.file('instance.cfg', `name=${data.title}`);

    await Promise.all([
      exportZip(dotMinecraftFolder, urls),
      (async () => {
        const meta = await fetch(
          `https://meta.prismlauncher.org/v1/net.minecraft/${data.gameVersion}.json`
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
          case 'fabric':
            mmcPack.components.push({
              uid: 'net.fabricmc.fabric-loader',
              version: await getLatestFabric(),
            });
            break;
          case 'forge':
            mmcPack.components.push({
              uid: 'net.minecraftforge',
              version: await getLatestForge(),
            });
            break;
          case 'quilt':
            mmcPack.components.push({
              uid: 'org.quiltmc.quilt-loader',
              version: await getLatestQuilt(),
            });
            break;
        }
        zipfile.file('mmc-pack.json', JSON.stringify(mmcPack));
      })(),
    ]);

    const zipBlob = await zipfile.generateAsync({ type: 'blob' });
    saveAs(zipBlob, `${data.title}.zip`);

    setStatus('result');
  };

  const submitHandle: FormEventHandler = async (e) => {
    e.preventDefault();
    if (!session.data || !resolvedMods) return;

    setIsSaving(true);

    const id = router.query.id as string;

    await fetch(`/api/list/${encodeURIComponent(id)}/update`, {
      method: 'POST',
      body: JSON.stringify({
        title: data.title,
        mods: resolvedMods.map(richModToMod),
        gameVersion: data.gameVersion,
        modloader: data.modloader,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    toast.success('Updated!');
    setIsSaving(false);
    setIsEditing(false);
  };

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

  const toggleLikeStatus = () => {
    if (session.status !== 'authenticated') {
      signIn();
      return;
    }

    if (hasLiked) {
      fetch(`/api/likes/dislike?id=${data.id}`).then((r) => {
        if (r.ok) setHasLiked(false);
      });
    } else {
      fetch(`/api/likes/like?id=${data.id}`).then((r) => {
        if (r.ok) setHasLiked(true);
      });
    }
  };

  const remixList = () => {
    if (session.status !== 'authenticated') {
      signIn();
      return;
    }

    fetch('/api/list/create', {
      method: 'POST',
      body: JSON.stringify({
        title: `${data.title} (copy)`,
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
        toast.success('Remixed list!');
      })
      .catch(() => {
        toast.error('Failed to remix list!');
      });
  };

  const deleteCurrentList = async () => {
    if (!data || !session.data) return;

    const a = await fetch(`/api/list/${data.id}/delete`);
    if (a.ok) {
      toast.success(`Deleted ${data.title} (${data.id})!`);
    } else {
      toast.error(`Failed to delete ${data.title} (${data.id})!`);
    }
    router.push('/lists');
  };

  if (!data) {
    return <FullLoadingScreen />;
  }

  return (
    <GlobalLayout title={data.title}>
      {data.legacy && <LegacyBadge className="mb-4" />}
      <div className="data-list mb-8">
        <p>
          For Minecraft <strong>{data.gameVersion}</strong> with{' '}
          <strong>{loaderFormat(data.modloader)}</strong>
        </p>
        <p>
          Last updated on{' '}
          <strong>{new Date(data.created_at).toDateString()}</strong>
        </p>
        {data.ownersExtraData && (
          <div className="mt-2 flex flex-row items-center gap-x-3">
            <img
              src={data.ownersExtraData.profilePicture}
              width={32}
              height={32}
              className="rounded-full"
              alt=""
            />
            <strong className="font-semibold">
              {data.ownersExtraData.name}
            </strong>
            {data.ownersExtraData.pro && <ProBadge />}
          </div>
        )}
      </div>

      <div className="mb-16 flex flex-wrap gap-x-4">
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
            <DropdownMenu.Content
              align="start"
              className="dropdown-menu-content z-40 mt-2 overflow-hidden rounded bg-neutral-50 shadow dark:bg-neutral-800"
            >
              <DropdownMenu.Item className="focus:outline-none">
                <button
                  className="dropdown-button"
                  onClick={downloadExport}
                  disabled={!data.mods.length}
                >
                  <ArchiveBoxIcon className="block h-5 w-5" />
                  <span>Zip archive</span>
                </button>
              </DropdownMenu.Item>
              <DropdownMenu.Item className="focus:outline-none">
                <button
                  className="dropdown-button"
                  onClick={modrinthExportInit}
                  disabled={!data.mods.length}
                >
                  <ModrinthIcon className="block h-5 w-5" />
                  <span>Modrinth pack</span>
                </button>
              </DropdownMenu.Item>
              <DropdownMenu.Item className="focus:outline-none">
                <button
                  className="dropdown-button"
                  onClick={packwizExport}
                  disabled={
                    !data.mods.length ||
                    session.data?.extraProfile.plan !== 'pro'
                  }
                >
                  <LinkIcon className="block h-5 w-5" />
                  <span>Copy packwiz link</span>
                  <ProBadge />
                </button>
              </DropdownMenu.Item>
              <DropdownMenu.Item className="focus:outline-none">
                <button
                  className="dropdown-button"
                  onClick={prismStaticExport}
                  disabled={!data.mods.length}
                >
                  <PrismIcon className="block h-5 w-5" />
                  <span>MultiMC</span>
                </button>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <button
                  className="dropdown-button"
                  onClick={prismExport}
                  disabled={
                    !data.mods.length ||
                    session.data?.extraProfile.plan !== 'pro'
                  }
                >
                  <PrismIcon className="block h-5 w-5" />
                  <span>MultiMC (auto-updating)</span>
                  <ProBadge />
                </button>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <button className="primaryish-button" onClick={toggleLikeStatus}>
          <HeartIcon
            className={clsx(
              'block h-5 w-5',
              hasLiked
                ? 'fill-current stroke-none'
                : 'fill-none stroke-current stroke-[1.5]'
            )}
          />
          <span>{!hasLiked ? 'Like' : 'Unlike'}</span>
        </button>

        <button className="primaryish-button" onClick={remixList}>
          <Square2StackIcon className="block h-5 w-5" />
          <span>Remix</span>
        </button>

        {session && session.data?.user.id === data.owner && (
          <>
            {!isEditing ? (
              <button
                className="primaryish-button secondaryish-instead"
                onClick={() => {
                  setIsEditing(true);
                }}
                disabled={isSaving}
              >
                <PencilIcon className="block h-5 w-5" />
                <span>Edit</span>
              </button>
            ) : (
              <button
                className="primaryish-button greenish"
                onClick={submitHandle}
                disabled={isSaving}
              >
                <RocketLaunchIcon className="block h-5 w-5" />
                <span>Save</span>
              </button>
            )}

            <Link
              className="primaryish-button secondaryish-instead"
              href={`/list/${data.customSlug ?? data.id}/settings`}
            >
              <CogIcon className="block h-5 w-5" />
              <span>Settings</span>
            </Link>

            <button
              className="primaryish-button oh-no"
              onClick={deleteCurrentList}
            >
              <TrashIcon className="block h-5 w-5" />
              <span>Delete</span>
            </button>
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
              className="moddermore-input flex-grow-0"
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
              className="moddermore-input flex-grow"
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

            <button
              type="button"
              className="primaryish-button"
              onClick={updateSearch}
            >
              Search
            </button>
          </div>

          {resolvedMods && searchResults.length > 0 && (
            <ul className="flex flex-wrap gap-y-2">
              {searchResults.map((res) =>
                resolvedMods.filter(
                  (m) => m.id === res.id && m.provider === res.provider
                ).length > 0 ? (
                  <></>
                ) : (
                  <li className="w-full" key={res.id}>
                    <RichModDisplay
                      data={res}
                      buttonType="add"
                      onClick={() => {
                        setResolvedMods([...resolvedMods, res]);
                      }}
                    />
                  </li>
                )
              )}
            </ul>
          )}
        </div>
      )}

      <ul className="flex flex-col gap-y-4">
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
