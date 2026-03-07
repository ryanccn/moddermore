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
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

import { fetchVersions as fetchCurseforgeVersions } from "~/lib/metadata/curseforge";
import { fetchVersions as fetchModrinthVersions } from "~/lib/metadata/modrinth";

import { numberFormat, providerFormat } from "~/lib/utils/strings";

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../shadcn/select";
import { Button } from "../shadcn/button";
import { Spinner } from "../shadcn/spinner";
import { ButtonGroup } from "../shadcn/button-group";

interface Props {
  data: RichMod;
  buttonType?: "add" | "delete" | null;
  onClick?: () => void | Promise<void>;
  showVersionSelect?: boolean;
  onVersion?: (version: string | null, name: string | null) => void | Promise<void>;
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
  const [fetchVersionStatus, setFetchVersionStatus] = useState<"idle" | "fetching" | "error">("idle");

  const versionDisplay = useMemo(
    () =>
      data.cachedVersionName ??
      (versions === null ? null : (versions.find((v) => v.id === selectedVersion)?.name ?? null)),
    [versions, selectedVersion, data.cachedVersionName],
  );

  const fetchVersionsIntoState = useCallback(async () => {
    if (!parent || versions !== null || fetchVersionStatus === "error") return;

    setFetchVersionStatus("fetching");

    const fetchedVersions = await (
      data.provider === "modrinth" ? fetchModrinthVersions : fetchCurseforgeVersions
    )({
      projectId: data.id,
      gameVersion: parent.gameVersion,
      loader: parent.modloader,
    });

    if (!fetchedVersions || fetchedVersions.length === 0) {
      toast.error("Encountered an error fetching versions");
      setFetchVersionStatus("error");
      return;
    }

    setVersions(fetchedVersions);
    if (!selectedVersion) {
      setSelectedVersion(fetchedVersions[0].id);
      if (onVersion) void onVersion(fetchedVersions[0].id, fetchedVersions[0].name);
    }

    setFetchVersionStatus("idle");
  }, [data.id, data.provider, versions, parent, selectedVersion, onVersion, fetchVersionStatus]);

  useEffect(() => {
    if (data.version)
      fetchVersionsIntoState().catch((error) => {
        console.error(error);
      });
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
        "flex size-full justify-between rounded-2xl border-none bg-neutral-50 p-5 dark:bg-neutral-900",
        incompatible ? "ring-2 ring-red-400 hover:ring-red-400" : null,
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
          <div className="mb-4 flex flex-col gap-y-1">
            <h2 className="mr-2 font-display text-xl font-bold tracking-tight">{data.name}</h2>
            <p className="my-0.5 text-sm text-neutral-700 dark:text-neutral-300">{data.description}</p>
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
              <div className="flex items-center gap-x-2 opacity-50 sm:justify-end">
                <ShieldCheckIcon className="block h-4 w-4" />
                <p className="font-medium">Latest</p>
              </div>
            ))}

          <ButtonGroup className="mt-12 self-end sm:items-end">
            {!!buttonType &&
              showVersionSelect !== false &&
              (!selectedVersion || versions === null ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    fetchVersionsIntoState().catch((error) => {
                      console.error(error);
                    });
                  }}
                  disabled={fetchVersionStatus !== "idle"}
                >
                  {fetchVersionStatus === "fetching" ? (
                    <Spinner className="block h-4 w-4" />
                  ) : (
                    <PinIcon className="block h-4 w-4" />
                  )}
                  <span>Select a version</span>
                </Button>
              ) : (
                <>
                  <Select
                    name={`${data.id}-version`}
                    value={selectedVersion ?? undefined}
                    onValueChange={(value) => {
                      setSelectedVersion(value);
                      if (onVersion) void onVersion(value, versions.find((v) => v.id === value)!.name);
                    }}
                  >
                    <SelectTrigger className="w-40 flex-grow-0">
                      <SelectValue placeholder="Search provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {versions.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => {
                      setSelectedVersion(null);
                      if (onVersion) void onVersion(null, null);
                    }}
                  >
                    <UnplugIcon />
                  </Button>
                </>
              ))}

            {onClick && (
              <>
                {buttonType === "delete" && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      void onClick();
                    }}
                  >
                    <TrashIcon />
                    <span>Delete</span>
                  </Button>
                )}

                {buttonType === "add" && (
                  <Button
                    type="button"
                    onClick={() => {
                      void onClick();
                    }}
                  >
                    <PlusIcon />
                    <span>Add</span>
                  </Button>
                )}
              </>
            )}
          </ButtonGroup>
        </div>
      </div>
    </div>
  );
};
