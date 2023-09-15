import type { NextPage } from "next";
import { type FormEventHandler, useCallback, useState } from "react";

import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

import { importMrpack } from "~/lib/import/mrpack";
import minecraftVersions from "~/lib/minecraftVersions.json";

import type { Mod, ModLoader } from "~/types/moddermore";

import { GlobalLayout } from "~/components/layout/GlobalLayout";
import { NewSubmitButton } from "~/components/partials/NewSubmitButton";
import { ProgressOverlay } from "~/components/ProgressOverlay";
import { buttonVariants } from "~/components/ui/Button";

import { PaperclipIcon } from "lucide-react";

import toast from "react-hot-toast";
import { twMerge } from "tailwind-merge";

const PrismImportPage: NextPage = () => {
  const sess = useSession({ required: true });

  const [title, setTitle] = useState("");
  const [gameVersion, setGameVersion] = useState(minecraftVersions[0]);
  const [mrpackFile, setMrpackFile] = useState<File | null>(null);
  const [modLoader, setModLoader] = useState<ModLoader>("quilt");

  const [progress, setProgress] = useState({ value: 0, max: 0 });
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  const submitHandle: FormEventHandler = useCallback(
    async (e) => {
      e.preventDefault();
      if (!sess.data) return;

      setSubmitting(true);

      const zipFileContent = await mrpackFile?.arrayBuffer();
      if (!zipFileContent) return;

      const parseResponse = await importMrpack({
        file: new Uint8Array(zipFileContent),
        setProgress,
      });

      if (!parseResponse) return;

      const res = await fetch("/api/list/create", {
        method: "POST",
        body: JSON.stringify({
          title,
          gameVersion,
          modloader: modLoader,
          mods: parseResponse.filter(Boolean) as Mod[],
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        toast.error("Couldn't create the list");
        return;
      }

      const { id } = await res.json();

      router.push(`/list/${id}`);
    },
    [title, gameVersion, modLoader, mrpackFile, router, sess.data],
  );

  return (
    <GlobalLayout title="Import from Modrinth pack" displayTitle={false}>
      <form className="flex flex-col items-start gap-y-6" onSubmit={submitHandle}>
        <input
          name="title"
          value={title}
          type="text"
          className="title w-full bg-transparent focus:outline-none focus:ring-0"
          placeholder="Enter the title..."
          aria-label="Title of the mod list"
          required
          onChange={(e) => {
            setTitle(e.target.value);
          }}
        />

        <div className="flex items-center gap-x-4">
          <select
            name="game-version"
            value={gameVersion}
            className="mm-input"
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

          <select
            name="modloader"
            value={modLoader}
            className="mm-input"
            aria-label="Mod loader"
            onChange={(e) => {
              setModLoader(e.target.value as ModLoader);
            }}
          >
            <option value="quilt">Quilt</option>
            <option value="fabric">Fabric</option>
            <option value="forge">Forge</option>
          </select>
        </div>

        <h2 className="mt-12 text-sm font-bold text-neutral-700 dark:text-neutral-300 tracking-tight">
          Modrinth pack (.mrpack)
        </h2>

        <div className="-mt-2 flex items-center gap-x-4">
          <label>
            <div
              role="button"
              className={twMerge(
                buttonVariants({
                  className: "flex cursor-auto hover:cursor-pointer",
                }),
              )}
            >
              <PaperclipIcon className="block w-5 h-5" />
              <span>Choose file</span>
            </div>

            <input
              name="mod-zip"
              type="file"
              className="sr-only"
              accept=".mrpack"
              required
              onChange={(e) => {
                setMrpackFile(e.target.files?.item(0) ?? null);
              }}
            />
          </label>

          {mrpackFile && <span className="text-lg font-medium">{mrpackFile.name}</span>}
        </div>

        <NewSubmitButton submitting={submitting} disabled={sess.status === "loading" || submitting} />
      </form>

      {submitting && <ProgressOverlay label="Searching for mods..." {...progress} />}
    </GlobalLayout>
  );
};

export default PrismImportPage;
