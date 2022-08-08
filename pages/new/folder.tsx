import type { NextPage } from 'next';
import { type FormEventHandler, useState } from 'react';

import { useRouter } from 'next/router';
import { useUser } from '@supabase/auth-helpers-react';

import { loadAsync } from 'jszip';
import { parseModFolder } from '~/lib/import/parseModFolder';
import minecraftVersions from '~/lib/minecraftVersions.json';
import type { Mod, ModLoader } from '~/types/moddermore';

import { GlobalLayout } from '~/components/layout/GlobalLayout';
import { ProgressOverlay } from '~/components/ProgressOverlay';
import { NewSubmitButton } from '~/components/partials/NewSubmitButton';
import { CloudUploadIcon } from '@heroicons/react/outline';

import { createList } from '~/lib/supabase';
import { useRequireAuth } from '~/hooks/useRequireAuth';
import { supabaseClient } from '@supabase/auth-helpers-nextjs';

const FeriumImportPage: NextPage = () => {
  useRequireAuth();

  const [title, setTitle] = useState('');
  const [gameVersion, setGameVersion] = useState(minecraftVersions[0]);
  const [modZipFile, setModZipFile] = useState<File | null>(null);
  const [modLoader, setModLoader] = useState<ModLoader>('fabric');

  const [progress, setProgress] = useState({ value: 0, max: 0 });
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();
  const { user, isLoading } = useUser();

  const submitHandle: FormEventHandler = async (e) => {
    e.preventDefault();

    if (!user) return;
    setSubmitting(true);

    const aaa = await modZipFile?.arrayBuffer();
    if (!aaa) throw aaa;

    const parsedMods = (await parseModFolder({
      f: await loadAsync(new Uint8Array(aaa)),
      setProgress,
    }).then((r) => r.filter((k) => k !== null))) as Mod[];

    const id = await createList(
      supabaseClient,
      { title, mods: parsedMods, gameVersion, modloader: modLoader },
      user
    );

    router.push(`/list/${id}`);
  };

  return (
    <GlobalLayout title="Import from folder" displayTitle={false}>
      <form
        className="flex flex-col items-start space-y-6"
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

        <div className="flex items-center space-x-4">
          <select
            name="game-version"
            value={gameVersion}
            className="moddermore-input"
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
            className="moddermore-input"
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

        <h2 className="!mt-12 text-sm font-bold uppercase text-zinc-800 dark:text-zinc-200">
          .zip file containing mods
        </h2>

        <div className="!mt-3 flex items-center space-x-4">
          <label>
            <div
              role="button"
              className="primaryish-button flex cursor-auto hover:cursor-pointer"
            >
              <CloudUploadIcon className="block h-5 w-5" />
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

        <NewSubmitButton disabled={!isLoading && submitting} />
      </form>

      {submitting && (
        <ProgressOverlay label="Searching for mods..." {...progress} />
      )}
    </GlobalLayout>
  );
};

export default FeriumImportPage;
