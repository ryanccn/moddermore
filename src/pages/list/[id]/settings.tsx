import { type GetServerSideProps, type NextPage } from "next";

import { useRouter } from "next/router";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";

import { getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import { authOptions } from "~/lib/authOptions";

import { ArrowLeftIcon, GlobeIcon, LockIcon, SaveIcon, ShieldIcon } from "lucide-react";
import Link from "next/link";
import { GlobalLayout } from "~/components/layout/GlobalLayout";
import { Spinner } from "~/components/partials/Spinner";
import { Button } from "~/components/ui/Button";

import { toast } from "react-hot-toast";
import { getSpecificList } from "~/lib/db";
import minecraftVersions from "~/lib/minecraftVersions.json";

import type { ModList, ModLoader } from "~/types/moddermore";
import { twMerge } from "tailwind-merge";

interface PageProps {
  data: ModList;
}

const MMRadio = <T extends string>({
  name,
  value,
  currentValue,
  onCheck,
  children,
  className,
}: {
  name: string;
  value: T;
  currentValue: T;
  onCheck?: (v: T) => void | Promise<void>;
  className?: string;
  children?: ReactNode | ReactNode[];
}) => {
  return (
    <label
      className={twMerge(
        "flex w-full flex-col items-start gap-y-2 rounded-md p-4 hover:cursor-pointer",
        value === currentValue ? "bg-indigo-500 text-white" : "bg-neutral-100 dark:bg-neutral-800",
        className,
      )}
    >
      <input
        type="radio"
        className="sr-only"
        name={name}
        value={value}
        checked={value === currentValue}
        onChange={(ev) => {
          if (onCheck && ev.target.value) onCheck(ev.target.value as T);
        }}
      />
      {children}
    </label>
  );
};

const ListSettings: NextPage<PageProps> = ({ data }) => {
  const session = useSession({ required: true });

  const hasElevatedPermissions = useMemo(
    () => session.data && (session.data.user.id === data.owner || session.data.extraProfile.isAdmin),
    [session.data, data.owner],
  );

  const [title, setTitle] = useState(data.title);
  const [description, setDescription] = useState(data.description);
  const [gameVersion, setGameVersion] = useState(data.gameVersion);
  const [modLoader, setModLoader] = useState<typeof data.modloader>(data.modloader);
  const [visibility, setVisibility] = useState<typeof data.visibility>(data.visibility);

  const [inProgress, setInProgress] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (session.status !== "authenticated") return;
    if (!hasElevatedPermissions) {
      toast.error("Unauthorized to edit list.");
      router.push(`/list/${data.id}`);
    }
  }, [session.status, hasElevatedPermissions, router, data.id]);

  const saveSettings = useCallback(() => {
    setInProgress(true);

    fetch(`/api/list/${encodeURIComponent(data.id)}/update`, {
      method: "POST",
      body: JSON.stringify({
        title,
        description: description || undefined,
        visibility,
        gameVersion,
        modloader: modLoader,
      }),
      headers: { "Content-Type": "application/json" },
    }).then(async (res) => {
      if (!res.ok) {
        const { error } = await res.json();

        toast.error(
          <div className="flex flex-col gap-y-1">
            <p className="font-semibold">Failed to update list settings!</p>
            <p className="text-sm">{error}</p>
          </div>,
        );

        setInProgress(false);
        return;
      }

      toast.success("Updated list settings!");
      setInProgress(false);
      router.push(`/list/${data.id}`);
    });
  }, [data, router, title, gameVersion, modLoader, description, visibility]);

  return (
    <GlobalLayout title={`Settings for ${data.title}`}>
      <Link href={`/list/${data.id}`} className="mb-8 flex flex-row items-center gap-x-1">
        <ArrowLeftIcon className="block h-3 w-3" />
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Back</span>
      </Link>

      <form
        className="mb-16 flex flex-col gap-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          saveSettings();
        }}
      >
        <label className="moddermore-form-label">
          <span>Title</span>
          <input
            className="mm-input"
            type="text"
            value={title}
            required
            onChange={(e) => {
              setTitle(e.target.value);
            }}
            disabled={inProgress}
          />
        </label>

        <label className="moddermore-form-label">
          <span>Description</span>
          <textarea
            className="mm-input min-h-[12rem]"
            value={description || ""}
            onChange={(e) => {
              setDescription(e.target.value);
            }}
            disabled={inProgress}
          />
        </label>

        <div className="flex flex-col gap-y-2">
          <span className="font-display text-sm font-bold">Visibility</span>
          <div className="flex w-full flex-col gap-2 self-stretch md:flex-row">
            <MMRadio name="visibility" value={"private"} currentValue={visibility} onCheck={setVisibility}>
              <div className="flex flex-row items-center gap-x-1.5">
                <LockIcon className="block h-4 w-4 shrink-0 opacity-75" strokeWidth={2.5} />
                <span className="font-display text-lg font-medium">Private</span>
              </div>
              <span className="text-xs opacity-60">
                Only accessible by you. Others visiting the link will see a 404.
              </span>
            </MMRadio>
            <MMRadio name="visibility" value={"unlisted"} currentValue={visibility} onCheck={setVisibility}>
              <div className="flex flex-row items-center gap-x-1.5">
                <ShieldIcon className="block h-4 w-4 shrink-0 opacity-75" strokeWidth={2.5} />
                <span className="font-display text-lg font-medium">Unlisted</span>
              </div>
              <span className="text-xs opacity-60">
                Anyone with the link will be able to see the list, and it should not be indexed by search
                engines.
              </span>
            </MMRadio>
            <MMRadio name="visibility" value={"public"} currentValue={visibility} onCheck={setVisibility}>
              <div className="flex flex-row items-center gap-x-1.5">
                <GlobeIcon className="block h-4 w-4 shrink-0 opacity-75" strokeWidth={2.5} />
                <span className="font-display text-lg font-medium">Public</span>
              </div>
              <span className="text-xs opacity-60">
                Anyone with the link will be able to see the list, and it will be available both in Search and
                to search engines.
              </span>
            </MMRadio>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          <label className="moddermore-form-label md:w-1/2">
            <span>Game version</span>
            <select
              name="game-version"
              value={gameVersion}
              aria-label="Game version"
              required
              onChange={(e) => {
                setGameVersion(e.target.value);
              }}
            >
              {minecraftVersions.map((v) => (
                <option value={v} key={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>

          <label className="moddermore-form-label md:w-1/2">
            <span>Mod loader</span>
            <select
              name="modloader"
              value={modLoader}
              aria-label="Mod loader"
              required
              onChange={(e) => {
                setModLoader(e.target.value as ModLoader);
              }}
            >
              <option value="quilt">Quilt</option>
              <option value="fabric">Fabric</option>
              <option value="forge">Forge</option>
              <option value="neoforge">NeoForge</option>
            </select>
          </label>
        </div>

        <Button type="submit" className="mt-4 self-start" disabled={inProgress}>
          {inProgress ? <Spinner className="h-5 w-5" /> : <SaveIcon className="block h-5 w-5" />}
          <span>Save</span>
        </Button>
      </form>
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

  res.setHeader("x-robots-tag", "noindex");

  if (!data || data.ownerProfile.banned) {
    return {
      notFound: true,
    };
  }

  const sess = await getServerSession(req, res, authOptions);
  if (sess?.user.id !== data.owner && !sess?.extraProfile.isAdmin) {
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

export default ListSettings;
