import type { NextPage } from "next";
import { type FormEventHandler, useCallback, useState } from "react";
import type { ModLoader, RichMod } from "~/types/moddermore";

import { richModToMod } from "~/lib/db/conversions";
import minecraftVersions from "~/lib/minecraftVersions.json";

import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

import { GlobalLayout } from "~/components/layout/GlobalLayout";
import { NewSubmitButton } from "~/components/partials/NewSubmitButton";
import { RichModDisplay } from "~/components/partials/RichModDisplay";

import toast from "react-hot-toast";
import { Search } from "~/components/partials/Search";

const ManualImportPage: NextPage = () => {
  const session = useSession({ required: true });

  const [title, setTitle] = useState("");
  const [gameVersion, setGameVersion] = useState(minecraftVersions.releases[0]);
  const [modLoader, setModLoader] = useState<ModLoader>("fabric");

  const [inputMods, setInputMods] = useState<RichMod[]>([]);

  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  const submitHandle: FormEventHandler = useCallback(
    (e) => {
      (async () => {
        e.preventDefault();
        if (!session.data) return;

        setSubmitting(true);

        const res = await fetch("/api/list/create", {
          method: "POST",
          body: JSON.stringify({
            title,
            gameVersion,
            modloader: modLoader,
            mods: inputMods.map((elem) => richModToMod(elem)),
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
    [gameVersion, inputMods, modLoader, router, session.data, title],
  );

  return (
    <GlobalLayout title="Manual creation" displayTitle={false}>
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

        <Search
          gameVersion={gameVersion}
          modLoader={modLoader}
          existing={inputMods}
          onAdd={(mod) => {
            setInputMods((prev) => [...prev, mod]);
          }}
        />

        <h2 className="mt-12 text-sm font-bold uppercase text-neutral-800 dark:text-neutral-200">
          Added mods
        </h2>
        <ul className="flex w-full flex-col gap-y-2">
          {inputMods.map((mod) => (
            <li key={mod.id}>
              <RichModDisplay
                data={mod}
                showVersionSelect={false}
                buttonType="delete"
                onClick={() => {
                  setInputMods(inputMods.filter((a) => a.id !== mod.id));
                }}
              />
            </li>
          ))}
        </ul>

        <NewSubmitButton submitting={submitting} disabled={session.status === "loading" || submitting} />
      </form>
    </GlobalLayout>
  );
};

export default ManualImportPage;
