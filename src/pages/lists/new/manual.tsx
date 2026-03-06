import type { NextPage } from "next";
import { type SubmitEventHandler, useCallback, useState } from "react";
import type { ModLoader, RichMod } from "~/types/moddermore";

import { richModToMod } from "~/lib/db/conversions";
import minecraftVersions from "~/lib/minecraftVersions.json";

import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

import { DashboardLayout } from "~/components/layout/DashboardLayout";
import { NewSubmitButton } from "~/components/partials/NewSubmitButton";
import { RichModDisplay } from "~/components/partials/RichModDisplay";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "~/components/shadcn/combobox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/shadcn/select";

import { toast } from "sonner";
import { Search } from "~/components/partials/Search";
import { loaderFormValues } from "~/lib/utils/strings";

const ManualImportPage: NextPage = () => {
  const session = useSession({ required: true });

  const [title, setTitle] = useState("");
  const [gameVersion, setGameVersion] = useState(minecraftVersions.releases[0]);
  const [modLoader, setModLoader] = useState<ModLoader>("fabric");

  const [inputMods, setInputMods] = useState<RichMod[]>([]);

  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  const submitHandle: SubmitEventHandler = useCallback(
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
    <DashboardLayout title="Manual creation">
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
          <Combobox
            name="game-version"
            required
            value={gameVersion}
            onValueChange={(value) => {
              if (value) setGameVersion(value);
            }}
            items={[...minecraftVersions.releases, ...minecraftVersions.snapshots]}
          >
            <ComboboxInput placeholder="Select a game version" />
            <ComboboxContent>
              <ComboboxEmpty>No versions found.</ComboboxEmpty>
              <ComboboxList>
                {(item: string) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>

          <Select
            required
            name="modloader"
            value={modLoader}
            onValueChange={(value) => {
              if (value) setModLoader(value as ModLoader);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Loader" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {loaderFormValues.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
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
    </DashboardLayout>
  );
};

export default ManualImportPage;
