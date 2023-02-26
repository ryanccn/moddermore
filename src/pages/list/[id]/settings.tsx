import { type GetServerSideProps, type NextPage } from 'next';

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { GlobalLayout } from '~/components/layout/GlobalLayout';
import { DocumentIcon } from '@heroicons/react/20/solid';

import { getSpecificList } from '~/lib/db';
import minecraftVersions from '~/lib/minecraftVersions.json';

import type { ModLoader, ModList } from '~/types/moddermore';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { ProBadge } from '~/components/partials/ProBadge';

interface PageProps {
  data: ModList;
}

const ListSettings: NextPage<PageProps> = ({ data }) => {
  const session = useSession({ required: true });

  const [title, setTitle] = useState(data.title);
  const [gameVersion, setGameVersion] = useState(data.gameVersion);
  const [modLoader, setModLoader] = useState<ModLoader>(data.modloader);
  const [customSlug, setCustomSlug] = useState('');

  const [inProgress, setInProgress] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (session.data?.user.id !== data.owner) {
      toast.error('Unauthorized to edit list.');
      router.push(`/list/${data.id}`);
    }
  }, [session, router, data]);

  const saveSettings = () => {
    setInProgress(true);

    fetch(`/api/update?id=${data.id}`, {
      method: 'POST',
      body: JSON.stringify({
        title,
        gameVersion,
        modloader: modLoader,
        ...(customSlug ? { customSlug } : {}),
      }),
      headers: { 'Content-Type': 'application/json' },
    }).then(async (res) => {
      if (!res.ok) {
        const { error } = await res.json();
        toast.error(
          <div className="flex flex-col gap-y-1">
            <p className="font-semibold">Failed to update list settings!</p>
            <p className="text-sm">{error}</p>
          </div>
        );
        setInProgress(false);
        return;
      }

      toast.success('Updated list settings!');
      setInProgress(false);
      router.push(`/list/${customSlug || data.id}`);
    });
  };

  return (
    <GlobalLayout title={`Settings for ${data.title}`}>
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
            className="moddermore-input"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
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
            onChange={(e) => {
              setModLoader(e.target.value as ModLoader);
            }}
          >
            <option value="quilt">Quilt</option>
            <option value="fabric">Fabric</option>
            <option value="forge">Forge</option>
          </select>
        </label>

        <label className="moddermore-form-label">
          <div className="flex flex-row gap-x-2">
            <span>Custom URL</span>
            <ProBadge />
          </div>
          <div className="flex flex-row items-center gap-x-2">
            <span className="text-neutral-500 dark:text-neutral-400">
              moddermore.net/list/
            </span>
            <input
              type="text"
              placeholder={data.id}
              value={customSlug}
              onChange={(e) => {
                setCustomSlug(e.target.value);
              }}
              disabled={session.data?.extraProfile.plan !== 'pro'}
            />
          </div>
        </label>

        <button
          type="submit"
          className="primaryish-button mt-4 self-start"
          disabled={inProgress}
        >
          <DocumentIcon className="block h-4 w-4" />
          <span>Save</span>
        </button>
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
      data: { ...data, legacy: data.legacy ? 'redacted' : null },
    },
  };
};

export default ListSettings;
