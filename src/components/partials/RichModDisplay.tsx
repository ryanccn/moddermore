/* eslint-disable @next/next/no-img-element */

import type { ModList, RichMod } from "~/types/moddermore";

import {
  ArrowUpRightIcon,
  DownloadIcon,
  PinIcon,
  PlusIcon,
  ShieldCheckIcon,
  TrashIcon,
  UnplugIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { twMerge } from "tailwind-merge";

import { fetchVersions as fetchCurseforgeVersions } from "~/lib/metadata/curseforge";
import { fetchVersions as fetchModrinthVersions } from "~/lib/metadata/modrinth";

import { numberFormat, providerFormat } from "~/lib/utils/strings";

import { Button } from "../ui/Button";
import { Spinner } from "./Spinner";

interface Props {
  data: RichMod;
  buttonType?: "add" | "delete" | null;
  onClick?: () => void | Promise<void>;
  showVersionSelect?: boolean;
  onVersion?: (version: string | null) => void | Promise<void>;
  className?: string;
  parent?: Pick<ModList, "modloader" | "gameVersion">;
}

export const RichModDisplay = ({
  data,
  buttonType,
  showVersionSelect,
  onClick,
  onVersion,
  className,
  parent,
}: Props) => {
  const incompatible = useMemo(
    () => parent && data.gameVersions && !data.gameVersions.includes(parent.gameVersion),
    [parent, data.gameVersions],
  );

  const [versions, setVersions] = useState<{ id: string; name: string }[] | null>(null);
  const [selectedVersion, setSelectedVersion] = useState(data.version ?? null);
  const [isFetchingVersions, setIsFetchingVersions] = useState(false);

  const versionDisplay = useMemo(
    () => (versions !== null ? versions.find((v) => v.id === selectedVersion)?.name ?? null : null),
    [versions, selectedVersion],
  );

  const fetchVersionsIntoState = useCallback(async () => {
    if (!parent) return;

    setIsFetchingVersions(true);

    const versions = await (data.provider === "modrinth" ? fetchModrinthVersions : fetchCurseforgeVersions)({
      projectId: data.id,
      gameVersion: parent.gameVersion,
      loader: parent.modloader,
    });

    if (!versions || versions.length === 0) {
      toast.error("Encountered an error fetching versions");
      setIsFetchingVersions(false);
      return;
    }

    setVersions(versions);
    if (!selectedVersion) {
      setSelectedVersion(versions[0].id);
      if (onVersion) onVersion(versions[0].id);
    }

    setIsFetchingVersions(false);
  }, [data.id, data.provider, parent, selectedVersion, onVersion]);

  useEffect(() => {
    if (data.version) fetchVersionsIntoState();
  }, [data.version, fetchVersionsIntoState]);

  useEffect(() => {
    const listener = () => {
      if (!data.version) {
        setSelectedVersion(null);
        setVersions(null);
      }
    };

    window.addEventListener("moddermoreUnpinAll", listener);
    return () => window.removeEventListener("moddermoreUnpinAll", listener);
  }, [data.version]);

  return (
    <div
      className={twMerge(
        "flex justify-between rounded-2xl border-none bg-neutral-100 p-5 dark:bg-neutral-800",
        incompatible ? "ring-2 ring-red-400/70 hover:ring-red-400/80" : null,
        className,
      )}
    >
      <div className="shrink-0">
        {data.iconUrl && (
          <img
            src={data.iconUrl}
            alt={`Icon of ${data.name}`}
            className="mr-6 h-16 w-16 rounded-2xl object-contain"
            width={64}
            height={64}
          />
        )}
      </div>

      <div className="flex grow flex-col gap-x-4 gap-y-2 sm:flex-row sm:justify-between">
        <div className="flex flex-col justify-between gap-y-2">
          <div className="flex flex-col gap-y-1">
            <h2 className="mr-2 font-display text-xl font-bold">{data.name}</h2>
            <p className="my-0.5">{data.description}</p>
          </div>

          {incompatible && (
            <div className="font-medium text-red-500 dark:text-red-400">Incompatible with current list!</div>
          )}

          <a
            className="group flex flex-wrap items-center gap-x-1 self-start underline decoration-black/50 underline-offset-2 transition-[text-decoration-color] hover:decoration-black/75 dark:decoration-white/50 dark:hover:decoration-white/75"
            href={data.href}
            rel="noreferrer noopener"
          >
            {providerFormat(data.provider)}
            <ArrowUpRightIcon className="block h-5 w-5" />
          </a>
        </div>

        <div className="flex min-w-fit flex-col gap-y-2">
          {data.downloads && (
            <div className="flex items-center gap-x-2 sm:justify-end">
              <DownloadIcon className="block h-4 w-4" />
              <p className="font-medium">
                <strong>{numberFormat(data.downloads)}</strong> downloads
              </p>
            </div>
          )}

          {(!buttonType || showVersionSelect === false) &&
            (versionDisplay ? (
              <div className="flex items-center gap-x-2 sm:justify-end">
                <PinIcon className="block h-4 w-4" />
                <p className="font-medium">{versionDisplay}</p>
              </div>
            ) : (
              <div className="flex items-center gap-x-2 sm:justify-end">
                <ShieldCheckIcon className="block h-4 w-4" />
                <p className="font-medium">Latest</p>
              </div>
            ))}

          <div className="mt-2 flex flex-col gap-y-2 sm:items-end">
            {!!buttonType &&
              showVersionSelect !== false &&
              (!selectedVersion || versions === null ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={fetchVersionsIntoState}
                  disabled={isFetchingVersions}
                >
                  {isFetchingVersions ? (
                    <Spinner className="block h-4 w-4" />
                  ) : (
                    <PinIcon className="block h-4 w-4" />
                  )}
                  <span>Select a version</span>
                </Button>
              ) : (
                <div className="flex flex-row items-center gap-x-3">
                  <select
                    name={`${data.id}-version`}
                    value={selectedVersion ?? undefined}
                    className="mm-input !bg-neutral-200 font-mono !text-sm !shadow-none dark:!bg-neutral-700"
                    onChange={(e) => {
                      setSelectedVersion(e.target.value);
                      if (onVersion) onVersion(e.target.value);
                    }}
                  >
                    {versions.map((version) => (
                      <option key={version.id} value={version.id}>
                        {version.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      setSelectedVersion(null);
                      if (onVersion) onVersion(null);
                    }}
                  >
                    <UnplugIcon className="block h-4 w-4 text-red-500 dark:text-red-400" />
                  </button>
                </div>
              ))}

            {onClick && (
              <>
                {buttonType === "delete" && (
                  <Button type="button" variant="danger" onClick={onClick}>
                    <TrashIcon className="block h-4 w-4" />
                    <span>Delete</span>
                  </Button>
                )}

                {buttonType === "add" && (
                  <Button type="button" variant="green" onClick={onClick}>
                    <PlusIcon className="block h-4 w-5" />
                    <span>Add</span>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
