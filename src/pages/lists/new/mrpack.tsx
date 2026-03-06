import type { NextPage } from "next";
import { type SubmitEventHandler, useCallback, useState } from "react";

import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

import { importMrpack } from "~/lib/import/mrpack";
import minecraftVersions from "~/lib/minecraftVersions.json";

import type { ModLoader } from "~/types/moddermore";

import { DashboardLayout } from "~/components/layout/DashboardLayout";
import { NewSubmitButton } from "~/components/partials/NewSubmitButton";
import { ProgressOverlay } from "~/components/ProgressOverlay";

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

import { PaperclipIcon } from "lucide-react";

import { toast } from "sonner";
import { loaderFormValues } from "~/lib/utils/strings";

const PrismImportPage: NextPage = () => {
  const sess = useSession({ required: true });

  const [title, setTitle] = useState("");
  const [gameVersion, setGameVersion] = useState(minecraftVersions.releases[0]);
  const [mrpackFile, setMrpackFile] = useState<File | null>(null);
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
            mods: parseResponse.filter(Boolean),
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
    [title, gameVersion, modLoader, mrpackFile, router, sess.data],
  );

  return (
    <DashboardLayout title="Import from Modrinth pack">
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

        <Field orientation="vertical">
          <FieldLabel>Modrinth pack (.mrpack)</FieldLabel>

          <label>
            <Button asChild>
              <div className="flex cursor-auto hover:cursor-pointer">
                <PaperclipIcon />
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
                setMrpackFile(e.target.files?.item(0) ?? null);
              }}
            />
          </label>

          {mrpackFile && <FieldDescription>{mrpackFile.name}</FieldDescription>}
        </Field>

        <NewSubmitButton submitting={submitting} disabled={sess.status === "loading" || submitting} />
      </form>

      {submitting && <ProgressOverlay label="Searching for mods..." {...progress} />}
    </DashboardLayout>
  );
};

export default PrismImportPage;
