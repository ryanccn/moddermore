import type { NextPage } from "next";
import { type SubmitEventHandler, useCallback, useState } from "react";

import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { toast } from "sonner";

import { parseFerium } from "~/lib/import/ferium";
import minecraftVersions from "~/lib/minecraftVersions.json";
import type { ModLoader } from "~/types/moddermore";

import { GlobalLayout } from "~/components/layout/GlobalLayout";
import { NewSubmitButton } from "~/components/partials/NewSubmitButton";

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
import { loaderFormValues } from "~/lib/utils/strings";
import { Textarea } from "~/components/shadcn/textarea";

const FeriumImportPage: NextPage = () => {
  const sess = useSession({ required: true });

  const [title, setTitle] = useState("");
  const [gameVersion, setGameVersion] = useState(minecraftVersions.releases[0]);
  const [modLoader, setModLoader] = useState<ModLoader>("fabric");
  const [feriumCopyPaste, setFeriumCopyPaste] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  const submitHandle: SubmitEventHandler = useCallback(
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
          className="title w-full bg-transparent focus:ring-0 focus:outline-none"
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

        <Textarea
          name="ferium-copy-paste"
          value={feriumCopyPaste}
          className="min-h-[10rem] resize-y"
          placeholder="Paste the output of `ferium list` here."
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
