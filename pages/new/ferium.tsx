import type { NextPage } from 'next';
import { type FormEventHandler, useState } from 'react';

import UploadIcon from '@heroicons/react/outline/UploadIcon';
import { useRouter } from 'next/router';
import { parseFerium } from '~/lib/ferium';

import type { ModLoader } from '~/lib/extra.types';
import Head from 'next/head';

const FeriumImportPage: NextPage = () => {
  const [title, setTitle] = useState('');
  const [gameVersion, setGameVersion] = useState('');
  const [modLoader, setModLoader] = useState<ModLoader>('fabric');
  const [feriumCopyPaste, setFeriumCopyPaste] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  const submitHandle: FormEventHandler = (e) => {
    e.preventDefault();

    setSubmitting(true);

    fetch('/api/new', {
      method: 'POST',
      body: JSON.stringify({
        title: title,
        gameVersion,
        modloader: modLoader,
        mods: parseFerium(feriumCopyPaste),
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

        <input
          name="game-version"
          value={gameVersion}
          type="text"
          className="moddermore-input"
          placeholder="Game version (e.g. 1.18.2)"
          required
          onChange={(e) => {
            setGameVersion(e.target.value);
          }}
        />

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

        <textarea
          name="ferium-copy-paste"
          value={feriumCopyPaste}
          className="moddermore-input min-h-[10rem] w-full resize-y font-mono"
          placeholder="Paste the output of `ferium list` here."
          required
          onChange={(e) => {
            setFeriumCopyPaste(e.target.value);
          }}
        />

        <button type="submit" disabled={submitting}>
          <UploadIcon className="block h-5 w-5" />
          <span>Submit</span>
        </button>
      </form>
    </div>
  );
};

export default FeriumImportPage;
