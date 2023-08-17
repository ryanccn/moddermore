import { type GetServerSideProps, type NextPage } from 'next';

import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';

import { GlobalLayout } from '~/components/layout/GlobalLayout';

import { getSpecificList } from '~/lib/db';
import minecraftVersions from '~/lib/minecraftVersions.json';

import type { ModLoader, ModList } from '~/types/moddermore';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '~/components/ui/Button';
import { ArrowLeftIcon, SaveIcon } from 'lucide-react';

interface PageProps {
  data: ModList;
}

const ListSettings: NextPage<PageProps> = ({ data }) => {
  const session = useSession({ required: true });

  const [title, setTitle] = useState(data.title);
  const [description, setDescription] = useState(data.description);
  const [gameVersion, setGameVersion] = useState(data.gameVersion);
  const [modLoader, setModLoader] = useState<ModLoader>(data.modloader);

  const [inProgress, setInProgress] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (session.status !== 'authenticated') return;
    if (session.data.user.id !== data.owner) {
      toast.error('Unauthorized to edit list.');
      router.push(`/list/${data.id}`);
    }
  }, [session, router, data]);

  const saveSettings = useCallback(() => {
    setInProgress(true);

    fetch(`/api/list/${encodeURIComponent(data.id)}/update`, {
      method: 'POST',
      body: JSON.stringify({
        title,
        description: description || undefined,
        gameVersion,
        modloader: modLoader,
      }),
      headers: { 'Content-Type': 'application/json' },
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

      toast.success('Updated list settings!');
      setInProgress(false);
      router.push(`/list/${data.id}`);
    });
  }, [data, router, title, gameVersion, modLoader, description]);

  return (
    <GlobalLayout title={`Settings for ${data.title}`}>
      <Link
        href={`/list/${data.id}`}
        className="mb-8 flex flex-row items-center gap-x-1"
      >
        <ArrowLeftIcon className="block h-3 w-3" />
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Back
        </span>
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
            value={description || ''}
            onChange={(e) => {
              setDescription(e.target.value);
            }}
            disabled={inProgress}
          />
        </label>

        <label className="moddermore-form-label">
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

        <label className="moddermore-form-label">
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
          </select>
        </label>

        <Button type="submit" className="mt-4 self-start" disabled={inProgress}>
          <SaveIcon className="block h-4 w-4" />
          <span>Save</span>
        </Button>
      </form>
    </GlobalLayout>
  );
};

export const getServerSideProps: GetServerSideProps<
  PageProps | { notFound: true }
> = async ({ query }) => {
  if (typeof query.id !== 'string') throw new Error('?');
  const data = await getSpecificList(query.id);

  if (!data) {
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
