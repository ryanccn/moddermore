import type { NextPage } from 'next';
import { type FormEventHandler, useState, useCallback } from 'react';

import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

import { loadAsync } from 'jszip';
import { parseModFolder } from '~/lib/import/parseModFolder';
import minecraftVersions from '~/lib/minecraftVersions.json';
import type { Mod, ModLoader } from '~/types/moddermore';

import { GlobalLayout } from '~/components/layout/GlobalLayout';
import { ProgressOverlay } from '~/components/ProgressOverlay';
import { NewSubmitButton } from '~/components/partials/NewSubmitButton';
import { buttonVariants } from '~/components/ui/Button';

import { UploadIcon } from 'lucide-react';

import toast from 'react-hot-toast';
import { twMerge } from 'tailwind-merge';

const FolderImportPage: NextPage = () => {
  const sess = useSession({ required: true });

  const [title, setTitle] = useState('');
  const [gameVersion, setGameVersion] = useState(minecraftVersions[0]);
  const [modZipFile, setModZipFile] = useState<File | null>(null);
  const [modLoader, setModLoader] = useState<ModLoader>('quilt');

  const [progress, setProgress] = useState({ value: 0, max: 0 });
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  const submitHandle: FormEventHandler = useCallback(
    async (e) => {
      e.preventDefault();

      if (!sess.data) return;
      setSubmitting(true);

      const zipFileContent = await modZipFile?.arrayBuffer();
      if (!zipFileContent) throw zipFileContent;

      const parsedMods = (await parseModFolder({
        f: await loadAsync(new Uint8Array(zipFileContent)),
        setProgress,
      }).then((r) => r.filter((k) => k !== null))) as Mod[];

      const res = await fetch('/api/list/create', {
        method: 'POST',
        body: JSON.stringify({
          title,
          gameVersion,
          modloader: modLoader,
          mods: parsedMods,
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        toast.error("Couldn't create the list");
        return;
      }

      const { id } = await res.json();

      router.push(`/list/${id}`);
    },
    [title, gameVersion, modLoader, sess, modZipFile, router],
  );

  return (
    <GlobalLayout title="Import from folder" displayTitle={false}>
      <form
        className="flex flex-col items-start gap-y-6"
        onSubmit={submitHandle}
      >
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

        <h2 className="mt-12 text-sm font-bold uppercase text-neutral-800 dark:text-neutral-200">
          .zip file containing mods
        </h2>

        <div className="mt-3 flex items-center gap-x-4">
          <label>
            <div
              role="button"
              className={twMerge(
                buttonVariants({
                  className: 'flex cursor-auto hover:cursor-pointer',
                }),
              )}
            >
              <UploadIcon className="block h-5 w-5" />
              <span>Choose file</span>
            </div>

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

          {modZipFile && (
            <span className="text-lg font-medium">{modZipFile.name}</span>
          )}
        </div>

        <NewSubmitButton disabled={sess.status === 'loading' || submitting} />
      </form>

      {submitting && (
        <ProgressOverlay label="Searching for mods..." {...progress} />
      )}
    </GlobalLayout>
  );
};

export default FolderImportPage;
