import type { NextPage } from 'next';
import { type FormEventHandler, useState } from 'react';

import UploadIcon from '@heroicons/react/outline/UploadIcon';
import { useRouter } from 'next/router';

import minecraftVersions from '~/lib/minecraftVersions.json';
import type { ModLoader } from '~/lib/extra.types';

import Head from 'next/head';
import { parseModFolder } from '~/lib/parseModFolder';
import ProgressOverlay from '~/components/ProgressOverlay';

const FeriumImportPage: NextPage = () => {
  const [title, setTitle] = useState('');
  const [gameVersion, setGameVersion] = useState(minecraftVersions[0]);
  const [modZipFile, setModZipFile] = useState<File | null>(null);
  const [modLoader, setModLoader] = useState<ModLoader>('fabric');

  const [progress, setProgress] = useState({ value: 0, max: 0 });
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  const submitHandle: FormEventHandler = async (e) => {
    e.preventDefault();

    setSubmitting(true);

    const aaa = await modZipFile?.arrayBuffer();
    if (!aaa) throw aaa;

    const parsedMods = await parseModFolder({
      f: aaa,
      gameVersion,
      loader: modLoader as ModLoader,
      setProgress,
    }).then((r) => r.filter(Boolean));

    fetch('/api/new', {
      method: 'POST',
      body: JSON.stringify({
        title: title,
        gameVersion,
        modloader: modLoader,
        mods: parsedMods,
      }),
      headers: { 'content-type': 'application/json' },
    }).then(async (r) => {
      if (!r.ok) {
        setSubmitting(false);
      } else {
        const data = await r.json();
        router.push(`/list/${data.id}`);
      }
    });
  };

  return (
    <div className="layout">
      <Head>
        <title>Ferium import / Moddermore</title>
      </Head>
      <form
        className="flex flex-col items-start space-y-4"
        onSubmit={submitHandle}
      >
        <input
          name="title"
          value={title}
          type="text"
          className="title w-full bg-transparent focus:outline-none focus:ring-0"
          placeholder="Enter the title..."
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
            onChange={(e) => {
              setModLoader(e.target.value as ModLoader);
            }}
          >
            <option value="quilt">Quilt</option>
            <option value="fabric">Fabric</option>
            <option value="forge">Forge</option>
          </select>
        </div>

        <input
          name="mod-zip"
          type="file"
          className="moddermore-input"
          required
          onChange={(e) => {
            setModZipFile(e.target.files?.item(0) ?? null);
          }}
        />

        <button
          type="submit"
          className="primaryish-button !mt-14"
          disabled={submitting}
        >
          <UploadIcon className="block h-5 w-5" />
          <span>Submit</span>
        </button>
      </form>
      {submitting && <ProgressOverlay {...progress} />}
    </div>
  );
};

export default FeriumImportPage;
