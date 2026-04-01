import type { NextPage } from "next";
import { type SubmitEventHandler, useCallback, useState } from "react";

import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

import { loadAsync } from "jszip";
import { parseModFolder } from "~/lib/import/parseModFolder";
import minecraftVersions from "~/lib/minecraftVersions.json";
import type { ModLoader } from "~/types/moddermore";

import { GlobalLayout } from "~/components/layout/GlobalLayout";
import { NewSubmitButton } from "~/components/partials/NewSubmitButton";
import { ProgressOverlay } from "~/components/ProgressOverlay";

import { UploadIcon } from "lucide-react";

import { toast } from "sonner";

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
import { Field, FieldDescription, FieldLabel } from "~/components/shadcn/field";
import { Button } from "~/components/shadcn/button";
import { loaderFormValues } from "~/lib/utils/strings";

const FolderImportPage: NextPage = () => {
  const sess = useSession({ required: true });

  const [title, setTitle] = useState("");
  const [gameVersion, setGameVersion] = useState(minecraftVersions.releases[0]);
  const [modZipFile, setModZipFile] = useState<File | null>(null);
  const [modLoader, setModLoader] = useState<ModLoader>("fabric");

  const [progress, setProgress] = useState({ value: 0, max: 0 });
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  const submitHandle: SubmitEventHandler = useCallback(
    (e) => {
      (async () => {
        e.preventDefault();

        if (!sess.data) return;
        setSubmitting(true);

        const zipFileContent = await modZipFile?.arrayBuffer();
        if (!zipFileContent) throw new Error("could not read zip file content");

        const parsedMods = await parseModFolder({
          f: await loadAsync(new Uint8Array(zipFileContent)),
          setProgress,
        }).then((r) => r.filter((k) => k !== null));

        const res = await fetch("/api/list/create", {
          method: "POST",
          body: JSON.stringify({
            title,
            gameVersion,
            modloader: modLoader,
            mods: parsedMods,
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
    [title, gameVersion, modLoader, sess, modZipFile, router],
  );

  return (
    <GlobalLayout title="Import from folder" displayTitle={false}>
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

        <Field orientation="vertical">
          <FieldLabel>.zip file containing mods</FieldLabel>

          <label>
            <Button asChild>
              <div className="flex cursor-auto hover:cursor-pointer">
                <UploadIcon />
                <span>Choose file</span>
              </div>
            </Button>

            <input
              name="mod-zip"
              type="file"
              className="sr-only"
              accept=".zip"
              required
              onChange={(e) => {
                setModZipFile(e.target.files?.item(0) ?? null);
              }}
            />
          </label>

          {modZipFile && <FieldDescription>{modZipFile.name}</FieldDescription>}
        </Field>

        <NewSubmitButton submitting={submitting} disabled={sess.status === "loading" || submitting} />
      </form>

      {submitting && <ProgressOverlay label="Searching for mods..." {...progress} />}
    </GlobalLayout>
  );
};

export default FolderImportPage;
