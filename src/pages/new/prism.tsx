import type { NextPage } from 'next';
import { type FormEventHandler, useState } from 'react';

import { useRouter } from 'next/router';

import { loadAsync } from 'jszip';
import { parsePrismInstance } from '~/lib/import/prism';
import minecraftVersions from '~/lib/minecraftVersions.json';

import type { Mod, ModLoader } from '~/types/moddermore';

import { GlobalLayout } from '~/components/layout/GlobalLayout';
import { ProgressOverlay } from '~/components/ProgressOverlay';
import { NewSubmitButton } from '~/components/partials/NewSubmitButton';
import { PaperClipIcon } from '@heroicons/react/24/solid';

import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';

const PrismInstanceImportPage: NextPage = () => {
  const sess = useSession({ required: true });

  const [title, setTitle] = useState('');
  const [gameVersion, setGameVersion] = useState(minecraftVersions[0]);
  const [instanceFile, setInstanceFile] = useState<File | null>(null);
  const [modLoader, setModLoader] = useState<ModLoader>('quilt');
  const [useMetadata, setUseMetadata] = useState(true);

  const [progress, setProgress] = useState({ value: 0, max: 0 });
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  const submitHandle: FormEventHandler = async (e) => {
    e.preventDefault();
    if (!sess.data) return;

    setSubmitting(true);

    const aaa = await instanceFile?.arrayBuffer();
    if (!aaa) throw aaa;

    const parseResponse = await parsePrismInstance({
      f: await loadAsync(new Uint8Array(aaa)),
      useMetadata,
      setProgress,
    });

    if (!parseResponse) {
      return;
    }

    const a = await fetch('/api/create', {
      method: 'POST',
      body: JSON.stringify({
        title,
        gameVersion,
        modloader: modLoader,
        mods: parseResponse.filter(Boolean) as Mod[],
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (!a.ok) {
      toast.error("Couldn't create the list");
      return;
    }

    const { id } = await a.json();

    router.push(`/list/${id}`);
  };

  return (
    <GlobalLayout title="Import from MultiMC / Prism" displayTitle={false}>
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

        <h2 className="!mt-12 text-sm font-bold uppercase text-neutral-800 dark:text-neutral-200">
          Exported instance from MultiMC / Prism Launcher
        </h2>

        <div className="!mt-3 flex items-center space-x-4">
          <label>
            <div
              role="button"
              className="primaryish-button flex cursor-auto hover:cursor-pointer"
            >
              <PaperClipIcon className="block h-5 w-5" />
              <span>Choose file</span>
            </div>

            <input
              name="mod-zip"
              type="file"
              className="sr-only"
              accept=".zip"
              required
              onChange={(e) => {
                setInstanceFile(e.target.files?.item(0) ?? null);
              }}
            />
          </label>

          {instanceFile && (
            <span className="text-lg font-medium">{instanceFile.name}</span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            className="rounded-sm bg-indigo-500"
            name="use-metadata"
            id="checkbox-use-metadata"
            checked={useMetadata}
            onChange={(e) => {
              setUseMetadata(e.target.checked);
            }}
          />
          <label htmlFor="checkbox-use-metadata">
            Use metadata generated by Prism?
          </label>
        </div>

        <NewSubmitButton disabled={sess.status === 'loading' || submitting} />
      </form>

      {submitting && (
        <ProgressOverlay label="Searching for mods..." {...progress} />
      )}
    </GlobalLayout>
  );
};

export default PrismInstanceImportPage;
