import type { NextPage } from "next";
import { type FormEventHandler, useCallback, useState } from "react";

import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import { parseFerium } from "~/lib/import/ferium";
import minecraftVersions from "~/lib/minecraftVersions.json";
import type { ModLoader } from "~/types/moddermore";

import { GlobalLayout } from "~/components/layout/GlobalLayout";
import { NewSubmitButton } from "~/components/partials/NewSubmitButton";

const FeriumImportPage: NextPage = () => {
  const sess = useSession({ required: true });

  const [title, setTitle] = useState("");
  const [gameVersion, setGameVersion] = useState(minecraftVersions.releases[0]);
  const [modLoader, setModLoader] = useState<ModLoader>("fabric");
  const [feriumCopyPaste, setFeriumCopyPaste] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  const submitHandle: FormEventHandler = useCallback(
    (e) => {
      (async () => {
        e.preventDefault();
        if (!sess.data) return;

        setSubmitting(true);

        const res = await fetch("/api/list/create", {
          method: "POST",
          body: JSON.stringify({
            title,
            gameVersion,
            modloader: modLoader,
            mods: parseFerium(feriumCopyPaste),
          }),
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          toast.error("Couldn't create the list");
          return;
        }

        const { id } = (await res.json()) as { id: string };
        await router.push(`/list/${id}`);
      })().catch((error) => {
        console.error(error);
      });
    },
    [title, gameVersion, modLoader, feriumCopyPaste, sess, router],
  );

  return (
    <GlobalLayout title="Ferium import" displayTitle={false}>
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
            {[...minecraftVersions.releases, ...minecraftVersions.snapshots].map((v) => (
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
            <option value="neoforge">NeoForge</option>
          </select>
        </div>

        <textarea
          name="ferium-copy-paste"
          value={feriumCopyPaste}
          className="mm-input min-h-[10rem] w-full resize-y font-mono"
          placeholder="Paste the output of `ferium list` here."
          aria-label="The output of `ferium list`"
          required
          onChange={(e) => {
            setFeriumCopyPaste(e.target.value);
          }}
        />

        <NewSubmitButton submitting={submitting} disabled={sess.status === "loading" || submitting} />
      </form>
    </GlobalLayout>
  );
};

export default FeriumImportPage;
