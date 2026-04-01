import { type GetServerSideProps, type NextPage } from "next";

import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import { authOptions } from "~/lib/authOptions";

import {
  ArrowLeftIcon,
  GlobeIcon,
  LockIcon,
  SaveIcon,
  SettingsIcon,
  ShieldIcon,
  TrashIcon,
} from "lucide-react";
import Link from "next/link";
import { GlobalLayout } from "~/components/layout/GlobalLayout";
import { Select as Select1 } from "~/components/ui/Select";
import Markdown from "react-markdown";

import { toast } from "sonner";
import { getSpecificList } from "~/lib/db";
import minecraftVersions from "~/lib/minecraftVersions.json";
import { loaderFormValues } from "~/lib/utils/strings";

import type { ModListWithExtraData, ModLoader } from "~/types/moddermore";

import { Button } from "~/components/shadcn/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "~/components/shadcn/field";
import { Input } from "~/components/shadcn/input";
import { Textarea } from "~/components/shadcn/textarea";
import { Spinner } from "~/components/shadcn/spinner";
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
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "~/components/shadcn/select";
import { ButtonGroup } from "~/components/shadcn/button-group";
import { Metadata } from "~/components/partials/Metadata";

interface PageProps {
  data: ModListWithExtraData;
}

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
      router.push(`/list/${data.id}`).catch((error) => {
        console.error(error);
      });
    }
  }, [session.status, hasElevatedPermissions, router, data.id]);

  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const confirmDeleteTimeoutID = useRef<number | null>(null);

  const deleteCurrentList = useCallback(async () => {
    if (!data || !session.data) return;

    if (!confirmDelete) {
      setConfirmDelete(true);
      confirmDeleteTimeoutID.current = window.setTimeout(() => {
        setConfirmDelete(false);
      }, 3000);

      return;
    }

    if (confirmDeleteTimeoutID.current) window.clearTimeout(confirmDeleteTimeoutID.current);

    setIsDeleting(true);

    const res = await fetch(`/api/list/${data.id}/delete`);

    if (res.ok) {
      toast.success(`Deleted ${data.title} (${data.id})!`);
    } else {
      toast.error(`Failed to delete ${data.title} (${data.id})!`);
    }

    await router.push("/lists");
  }, [router, data, session, confirmDelete, confirmDeleteTimeoutID, setConfirmDelete]);

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
    })
      .then(async (res) => {
        if (!res.ok) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
        await router.push(`/list/${data.id}`);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [data, router, title, gameVersion, modLoader, description, visibility]);

  return (
    <GlobalLayout title={data.title}>
      {data.description && (
        <div className="-mt-6 mb-8 text-lg font-medium [&_a]:underline [&_a]:decoration-neutral-200 dark:[&_a]:decoration-neutral-500">
          <Markdown skipHtml allowedElements={["p", "span", "a", "strong", "em", "b", "i", "mark"]}>
            {data.description}
          </Markdown>
        </div>
      )}

      <Metadata data={data} />

      {data.ownerProfile && (
        <div className="mt-6 mb-8 flex flex-row items-center gap-x-3">
          {data.ownerProfile.profilePicture ? (
            <img
              src={data.ownerProfile.profilePicture}
              width={32}
              height={32}
              className="size-[32px] rounded-full"
              alt=""
            />
          ) : (
            <div className="h-[32px] w-[32px] rounded-full bg-neutral-100 dark:bg-neutral-700" />
          )}

          <strong className="font-semibold">{data.ownerProfile.name}</strong>
        </div>
      )}

      <ButtonGroup className="mb-8">
        <Button size="default" variant="outline" asChild>
          <Link href={`/list/${data.id}`}>
            <ArrowLeftIcon />
            Back
          </Link>
        </Button>

        <Button size="default" variant="default" asChild>
          <Link href={`/list/${data.id}/settings`}>
            <SettingsIcon />
            Settings
          </Link>
        </Button>

        <Button
          size="default"
          variant="destructive"
          onClick={() => {
            deleteCurrentList().catch((error) => {
              console.error(error);
            });
          }}
          disabled={isDeleting}
        >
          {isDeleting ? <Spinner /> : <TrashIcon />}
          {confirmDelete ? <span>Confirm deletion?</span> : <span>Delete</span>}
        </Button>
      </ButtonGroup>

      <form
        className="mb-16 flex flex-col gap-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          saveSettings();
        }}
      >
        <FieldGroup>
          <Field>
            <FieldLabel>Title</FieldLabel>
            <Input
              type="text"
              value={title}
              required
              onChange={(e) => {
                setTitle(e.target.value);
              }}
              disabled={inProgress}
            />
          </Field>

          <Field>
            <FieldLabel>Description</FieldLabel>
            <Textarea
              value={description || ""}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
              disabled={inProgress}
            />
            <FieldDescription>You can use a restricted subset of Markdown here.</FieldDescription>
          </Field>

          <Field>
            <FieldLabel>Visibility</FieldLabel>

            <div className="flex w-full flex-col gap-2 self-stretch md:flex-row">
              <Select1 name="visibility" value={"private"} currentValue={visibility} onCheck={setVisibility}>
                <div className="flex flex-row items-center gap-x-1.5">
                  <LockIcon className="block h-4 w-4 shrink-0 opacity-75" strokeWidth={2.5} />
                  <span className="font-display text-lg font-medium">Private</span>
                </div>
                <span className="text-xs opacity-60">
                  Only accessible by you. Others visiting the link will see a 404.
                </span>
              </Select1>
              <Select1 name="visibility" value={"unlisted"} currentValue={visibility} onCheck={setVisibility}>
                <div className="flex flex-row items-center gap-x-1.5">
                  <ShieldIcon className="block h-4 w-4 shrink-0 opacity-75" strokeWidth={2.5} />
                  <span className="font-display text-lg font-medium">Unlisted</span>
                </div>
                <span className="text-xs opacity-60">
                  Anyone with the link will be able to see the list, and it should not be indexed by search
                  engines.
                </span>
              </Select1>
              <Select1 name="visibility" value={"public"} currentValue={visibility} onCheck={setVisibility}>
                <div className="flex flex-row items-center gap-x-1.5">
                  <GlobeIcon className="block h-4 w-4 shrink-0 opacity-75" strokeWidth={2.5} />
                  <span className="font-display text-lg font-medium">Public</span>
                </div>
                <span className="text-xs opacity-60">
                  Anyone with the link will be able to see the list, and it will be available both in Search
                  and to search engines.
                </span>
              </Select1>
            </div>
          </Field>

          <div className="flex flex-col gap-4 md:flex-row">
            <Field>
              <FieldLabel>Game version</FieldLabel>
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
            </Field>

            <Field>
              <FieldLabel>Loader</FieldLabel>
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
            </Field>
          </div>

          <Button type="submit" size="lg" className="mt-4 self-start" disabled={inProgress}>
            {inProgress ? <Spinner /> : <SaveIcon />}
            <span>Save</span>
          </Button>
        </FieldGroup>
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
  const sess = await getServerSession(req, res, authOptions);

  res.setHeader("x-robots-tag", "noindex");

  if (!data || (data.ownerProfile.banned && !sess?.extraProfile.isAdmin)) {
    return { notFound: true };
  }

  if (data.visibility === "private" && sess?.user.id !== data.owner && !sess?.extraProfile.isAdmin) {
    return { notFound: true };
  }

  return {
    props: {
      data: { ...data },
    },
  };
};

export default ListSettings;
