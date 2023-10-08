/* eslint-disable @next/next/no-img-element */

import type { GetServerSideProps, NextPage } from "next";

import type { ModListCreate, ModListWithExtraData, RichMod } from "~/types/moddermore";

import { richModToMod } from "~/lib/db/conversions";
import { getInfos as getCurseForgeInfos } from "~/lib/metadata/curseforge";
import { getInfos as getModrinthInfos } from "~/lib/metadata/modrinth";
import { loaderFormat } from "~/lib/strings";

import { useRouter } from "next/router";
import { FormEventHandler, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getServerSession } from "next-auth";
import { signIn, useSession } from "next-auth/react";
import { authOptions } from "~/lib/authOptions";
import { getSpecificList } from "~/lib/db";

import { modrinthExport } from "~/lib/export/formats/mrpack";
import { prismAutoUpdateExport, prismStaticExport } from "~/lib/export/formats/prism";
import { ExportStatus } from "~/lib/export/formats/shared";
import { zipExport } from "~/lib/export/formats/zip";

import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Markdown from "react-markdown";

import Head from "next/head";
import Link from "next/link";

import { GlobalLayout } from "~/components/layout/GlobalLayout";
import { DonationMessage } from "~/components/partials/DonationMessage";
import { RichModDisplay } from "~/components/partials/RichModDisplay";
import { Search } from "~/components/partials/Search";
import { Spinner } from "~/components/partials/Spinner";
import { ProgressOverlay } from "~/components/ProgressOverlay";
import { Button, buttonVariants } from "~/components/ui/Button";

import {
  AreaChartIcon,
  ClipboardIcon,
  CloudIcon,
  CodeIcon,
  CopyIcon,
  DownloadIcon,
  EditIcon,
  FolderArchiveIcon,
  HammerIcon,
  HeartIcon,
  HexagonIcon,
  SaveIcon,
  SettingsIcon,
  TrashIcon,
  UnplugIcon,
} from "lucide-react";
import { MarkdownIcon, ModrinthIcon } from "~/components/icons";

import toast from "react-hot-toast";
import { twMerge } from "tailwind-merge";

interface PageProps {
  data: ModListWithExtraData;
}

const ListPage: NextPage<PageProps> = ({ data }) => {
  const router = useRouter();
  const session = useSession();

  const hasElevatedPermissions = useMemo(
    () => session.data && (session.data.user.id === data.owner || session.data.extraProfile.isAdmin),
    [session.data, data.owner],
  );

  const isAdmin = useMemo(() => session.data?.extraProfile.isAdmin === true, [session.data]);

  const [resolvedMods, setResolvedMods] = useState<RichMod[] | null>(null);
  const [oldMods, setOldMods] = useState<RichMod[] | null>(null);

  const [status, setStatus] = useState<ExportStatus>(ExportStatus.Idle);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBanning, setIsBanning] = useState(false);

  const [hasLiked, setHasLiked] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const confirmDeleteTimeoutID = useRef<number | null>(null);

  const [confirmBan, setConfirmBan] = useState(false);
  const confirmBanTimeoutID = useRef<number | null>(null);

  const [mrpackName, setMrpackName] = useState(data.title);
  const [mrpackVersion, setMrpackVersion] = useState("0.0.1");
  const [mrpackCurseForgeStrategy, setMrpackCurseForgeStrategy] = useState("skip");

  const [progress, setProgress] = useState({ value: 0, max: 0 });
  const [result, setResult] = useState<{ success: string[]; failed: string[] }>({
    success: [],
    failed: [],
  });

  useEffect(() => {
    (async () => {
      const [modrinthMods, curseForgeMods] = await Promise.all([
        getModrinthInfos(
          data.mods
            .filter((k) => k.provider === "modrinth")
            .map((k) => ({ id: k.id, version: k.version ?? undefined })),
        ),
        getCurseForgeInfos(
          data.mods
            .filter((k) => k.provider === "curseforge")
            .map((k) => ({ id: k.id, version: k.version ?? undefined })),
        ),
      ]);

      if (modrinthMods === null) {
        throw new Error("Failed to resolve Modrinth mods");
      }

      const mods = [...modrinthMods, ...curseForgeMods]
        .filter((k) => k !== null)
        .sort((a, b) => (a!.name > b!.name ? 1 : -1));

      setResolvedMods(mods as RichMod[]);
      setOldMods(mods as RichMod[]);
    })().catch((error) => {
      console.error(error);
      toast.error("Failed to resolve mods");
    });
  }, [data]);

  useEffect(() => {
    if (session.status !== "authenticated") return;

    fetch(`/api/likes/status?id=${data.id}`).then(async (r) => {
      if (!r.ok) {
        toast.error("Error fetching like status");
        return;
      }

      const { data: hasLikedRemote } = (await r.json()) as { data: boolean };
      setHasLiked(hasLikedRemote);
    });
  }, [data.id, session.status]);

  const showResultModal = useMemo(() => status === ExportStatus.Result, [status]);

  const modrinthExportInit = () => {
    setStatus(ExportStatus.ModrinthForm);
  };

  const packwizExport = async () => {
    try {
      await navigator.clipboard.writeText(
        new URL(`/list/${data.id}/packwiz/pack.toml`, location.href).toString(),
      );
      toast.success("Copied link to clipboard");
    } catch {
      toast.error("Failed to copy link to clipboard");
    }
  };

  const submitHandle: FormEventHandler = useCallback(
    async (e) => {
      e.preventDefault();
      if (!session.data || !resolvedMods || !oldMods) return;

      setIsSaving(true);

      const res = await fetch(`/api/list/${encodeURIComponent(data.id)}/update`, {
        method: "POST",
        body: JSON.stringify({
          ...data,
          mods: resolvedMods.map((elem) => richModToMod(elem)),
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        toast.error("Failed to update mods!");
        setIsSaving(false);
        setIsEditing(false);
        return;
      }

      const removedMods = oldMods.filter(
        (oldMod) => !resolvedMods.some((k) => k.id === oldMod.id && k.provider === oldMod.provider),
      );
      const addedMods = resolvedMods.filter(
        (resolvedMod) => !oldMods.some((k) => k.id === resolvedMod.id && k.provider === resolvedMod.provider),
      );

      const changelog = `
## Added mods

${
  addedMods.length > 0
    ? addedMods.map((k) => `- [${k.name}](${k.href}) - ${k.description}`).join("\n")
    : "*None*"
}

## Removed mods

${
  removedMods.length > 0
    ? removedMods.map((k) => `- [${k.name}](${k.href}) - ${k.description}`).join("\n")
    : "*None*"
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

  const unpinAll = useCallback(() => {
    if (!resolvedMods) return;
    for (const mod of resolvedMods) {
      mod.version = undefined;
    }
    window.dispatchEvent(new Event("moddermoreUnpinAll"));
    setResolvedMods([...resolvedMods]);
  }, [resolvedMods]);

  const copyMarkdownList = useCallback(() => {
    if (!resolvedMods) return;

    const text = resolvedMods.map((k) => `- [**${k.name}**](${k.href}) - ${k.description}`).join("\n");

    navigator.clipboard.writeText(text).then(() => {
      toast.success("Copied Markdown to clipboard!");
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
        toast.success("Copied JSON to clipboard!");
      });
  }, [data]);

  const toggleLikeStatus = useCallback(() => {
    if (session.status !== "authenticated") {
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
    if (session.status !== "authenticated") {
      signIn();
      return;
    }

    setIsDuplicating(true);

    fetch("/api/list/create", {
      method: "POST",
      body: JSON.stringify({
        title: `${data.title} (copy)`,
        description: data.description ?? undefined,
        gameVersion: data.gameVersion,
        modloader: data.modloader,
        mods: data.mods,
      } satisfies ModListCreate),
      headers: { "Content-Type": "application/json" },
    })
      .then(async (res) => {
        if (!res.ok) return;

        const { id } = (await res.json()) as { id: string };
        router.push(`/list/${id}`);

        toast.success("Duplicated list!");
      })
      .catch(() => {
        toast.error("Failed to duplicate list!");
      })
      .finally(() => {
        setIsDuplicating(false);
      });
  }, [data, session, router]);

  const deleteCurrentList = useCallback(async () => {
    if (!data || !session.data) return;

    if (!confirmDelete) {
      setConfirmDelete(true);
      confirmDeleteTimeoutID.current = window.setTimeout(() => {
        setConfirmDelete(false);
      }, 3000);

      return;
    }

    if (confirmDeleteTimeoutID.current) window.clearTimeout(confirmDeleteTimeoutID.current);

    setIsDeleting(true);

    const res = await fetch(`/api/list/${data.id}/delete`);

    if (res.ok) {
      toast.success(`Deleted ${data.title} (${data.id})!`);
    } else {
      toast.error(`Failed to delete ${data.title} (${data.id})!`);
    }

    router.push("/lists");
  }, [router, data, session, confirmDelete, confirmDeleteTimeoutID, setConfirmDelete]);

  const ban = useCallback(async () => {
    if (!data || !session.data) return;

    if (!confirmBan) {
      setConfirmBan(true);
      confirmBanTimeoutID.current = window.setTimeout(() => {
        setConfirmBan(false);
      }, 3000);
      return;
    }

    if (confirmBanTimeoutID.current) window.clearTimeout(confirmBanTimeoutID.current);

    setIsBanning(true);

    const res = await fetch(`/api/ban`, {
      method: "POST",
      body: JSON.stringify({ id: data.owner }),
      headers: { "content-type": "application/json" },
    });

    if (res.ok) {
      toast.success(`Banned ${data.owner}!`);
      router.push("/lists");
    } else {
      toast.error(`Failed to ban ${data.owner}!`);
    }
  }, [router, data, session, confirmBan, confirmBanTimeoutID, setConfirmBan]);

  return (
    <GlobalLayout title={data.title}>
      {data.description && (
        <div className="-mt-6 text-lg font-medium mb-8">
          <Markdown skipHtml disallowedElements={["h1", "h2", "h3", "h4", "h5", "h6"]}>
            {data.description}
          </Markdown>
        </div>
      )}

      <div className="data-list">
        <p>
          For Minecraft <strong>{data.gameVersion}</strong> with{" "}
          <strong>{loaderFormat(data.modloader)}</strong>
        </p>
        <p>
          Created <strong>{new Date(data.created_at).toDateString()}</strong>
        </p>
        <p>
          <strong>{data.likes}</strong> {data.likes === 1 ? "like" : "likes"}
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
              <DownloadIcon className="block w-5 h-5" />
              <span>Export as...</span>
            </Button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content align="start" className="radix-dropdown-menu-content">
              <DropdownMenu.Item asChild>
                <button
                  className="radix-dropdown-button"
                  onClick={() => {
                    if (resolvedMods) {
                      zipExport({
                        data: { ...data, mods: resolvedMods },
                        setProgress,
                        setResult,
                        setStatus,
                      });
                    }
                  }}
                >
                  <FolderArchiveIcon className="block w-5 h-5" />
                  <span>Zip archive</span>
                </button>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <button className="radix-dropdown-button" onClick={modrinthExportInit}>
                  <ModrinthIcon className="block w-5 h-5" />
                  <span>Modrinth pack</span>
                </button>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <button
                  className="radix-dropdown-button"
                  onClick={packwizExport}
                  disabled={data.visibility === "private"}
                >
                  <CloudIcon className="block w-5 h-5" />
                  <span>Copy packwiz link</span>
                </button>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <button
                  className="radix-dropdown-button"
                  onClick={() => {
                    if (resolvedMods) {
                      prismStaticExport({
                        data: { ...data, mods: resolvedMods },
                        setProgress,
                        setResult,
                        setStatus,
                      });
                    }
                  }}
                >
                  <HexagonIcon className="block w-5 h-5" />
                  <span>MultiMC</span>
                </button>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <button
                  className="radix-dropdown-button"
                  onClick={() => {
                    if (resolvedMods) {
                      prismAutoUpdateExport({
                        data: { ...data, mods: resolvedMods },
                        setProgress,
                        setResult,
                        setStatus,
                      });
                    }
                  }}
                  disabled={data.visibility === "private"}
                >
                  <div className="relative">
                    <HexagonIcon className="block w-5 h-5" />
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
              <ClipboardIcon className="block w-5 h-5" />
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
                  <MarkdownIcon className="block w-5 h-5" />
                  <span>Markdown list</span>
                </button>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <button
                  className="radix-dropdown-button"
                  onClick={copyJSON}
                  disabled={data.mods.length === 0}
                >
                  <CodeIcon className="block w-5 h-5" />
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
                "block w-5 h-5",
                hasLiked ? "fill-current stroke-none" : "fill-none stroke-current",
              )}
            />
          ) : (
            <Spinner className="block w-5 h-5 fill-current" />
          )}
          <span>{!hasLiked ? "Like" : "Unlike"}</span>
        </Button>

        <Button onClick={duplicateList}>
          {isDuplicating ? (
            <Spinner className="block w-5 h-5 fill-current" />
          ) : (
            <CopyIcon className="block w-5 h-5" />
          )}
          <span>Duplicate</span>
        </Button>

        {hasElevatedPermissions && (
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
                  <Spinner className="block w-5 h-5 fill-current" />
                ) : (
                  <EditIcon className="block w-5 h-5" />
                )}
                <span>Edit</span>
              </Button>
            ) : (
              <Button variant="green" onClick={submitHandle} disabled={isSaving}>
                {isSaving ? <Spinner className="block w-5 h-5" /> : <SaveIcon className="block w-5 h-5" />}
                <span>Save</span>
              </Button>
            )}

            <Link className={buttonVariants({ variant: "secondary" })} href={`/list/${data.id}/settings`}>
              <SettingsIcon className="block w-5 h-5" />
              <span>Settings</span>
            </Link>

            <Link className={buttonVariants({ variant: "primary" })} href={`/list/${data.id}/analytics`}>
              <AreaChartIcon className="block w-5 h-5" />
              <span>Analytics</span>
            </Link>

            <Button variant="danger" onClick={deleteCurrentList} disabled={isDeleting}>
              {isDeleting ? <Spinner className="block w-5 h-5" /> : <TrashIcon className="block w-5 h-5" />}
              {confirmDelete ? <span>Confirm deletion?</span> : <span>Delete</span>}
            </Button>

            {isAdmin && (
              <Button variant="danger" onClick={ban} disabled={isBanning}>
                {isBanning ? <Spinner className="block w-5 h-5" /> : <HammerIcon className="block w-5 h-5" />}
                {confirmBan ? <span>Confirm ban?</span> : <span>Ban</span>}
              </Button>
            )}
          </>
        )}
      </div>

      {isEditing && resolvedMods && (
        <>
          <Head>
            <title>Editing {data.title}</title>
          </Head>
          <Search
            gameVersion={data.gameVersion}
            modLoader={data.modloader}
            existing={resolvedMods}
            onAdd={(mod) => {
              setResolvedMods((prev) => (prev ? [...prev, mod] : [mod]));
            }}
          />
          <div className="flex flex-row flex-wrap gap-x-2 justify-end">
            <Button variant="danger" onClick={unpinAll}>
              <UnplugIcon className="block w-4 h-4" />
              <span>Unpin all</span>
            </Button>
          </div>
        </>
      )}

      <DonationMessage />

      <ul className="mt-8 flex flex-col gap-y-4">
        {resolvedMods ? (
          resolvedMods.map((mod) => (
            <li className="w-full" key={mod.id}>
              <RichModDisplay
                data={mod}
                buttonType={isEditing ? "delete" : null}
                onClick={() => {
                  setResolvedMods((prev) => (prev ? prev.filter((a) => a.id !== mod.id) : []));
                }}
                onVersion={(version) => {
                  setResolvedMods((prev) => {
                    if (!prev) return [];

                    const workingCopy = [...prev];
                    for (const prevMod of workingCopy) {
                      if (prevMod.id === mod.id) {
                        prevMod.version = version ?? undefined;
                        break;
                      }
                    }
                    return workingCopy;
                  });
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

      {status === ExportStatus.Resolving ? (
        <ProgressOverlay label="Resolving mods..." {...progress} />
      ) : status === ExportStatus.Downloading ? (
        <ProgressOverlay label="Downloading mods..." {...progress} />
      ) : status === ExportStatus.GeneratingZip ? (
        <ProgressOverlay label="Getting the .zip file ready..." {...progress} />
      ) : null}

      <Dialog.Root
        open={status === ExportStatus.ModrinthForm}
        onOpenChange={(open) => {
          if (!open) setStatus(ExportStatus.Idle);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="dialog overlay" />
          <Dialog.Content className="dialog content">
            <form
              className="flex flex-col gap-y-8"
              onSubmit={(e) => {
                e.preventDefault();
                if (resolvedMods) {
                  modrinthExport({
                    data: { ...data, mods: resolvedMods },
                    mrpackData: {
                      name: mrpackName,
                      version: mrpackVersion,
                      cfStrategy: mrpackCurseForgeStrategy,
                    },
                    setProgress,
                    setResult,
                    setStatus,
                  });
                }
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
                <span className="text-sm font-medium">CurseForge mods</span>
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

              {mrpackCurseForgeStrategy !== "skip" && (
                <div className="rounded bg-yellow-100 p-4 font-semibold text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100">
                  {mrpackCurseForgeStrategy === "embed"
                    ? "Make sure you have the rights to embed these files in your modpack distribution!"
                    : "This modpack will be ineligible for publication on Modrinth."}
                </div>
              )}

              <Button variant="modrinth" type="submit" className="self-start">
                <ModrinthIcon className="block w-5 h-5" />
                <span>Start export</span>
              </Button>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root
        open={showResultModal}
        onOpenChange={(open) => {
          if (!open) setStatus(ExportStatus.Idle);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="dialog overlay" />
          <Dialog.Content className="dialog content">
            <div className="flex flex-col gap-y-4">
              <div className="results-list">
                <details>
                  <summary className="text-green-400">{result.success.length} successful downloads</summary>
                  <ul>
                    {result.success.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </details>

                <details>
                  <summary className="text-red-400">{result.failed.length} failed</summary>
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
                  setStatus(ExportStatus.Idle);
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

export const getServerSideProps: GetServerSideProps<PageProps | { notFound: true }> = async ({
  query,
  req,
  res,
}) => {
  if (typeof query.id !== "string") throw new Error("?");
  const data = await getSpecificList(query.id);

  if (!data || data.ownerProfile.banned) {
    return {
      notFound: true,
    };
  }

  const sess = await getServerSession(req, res, authOptions);
  if (data.visibility === "private" && sess?.user.id !== data.owner && !sess?.extraProfile.isAdmin) {
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
