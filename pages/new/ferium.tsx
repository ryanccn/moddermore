import type { NextPage } from 'next';
import { type FormEventHandler, useState } from 'react';

import { useRouter } from 'next/router';

import { parseFerium } from '~/lib/ferium';
import minecraftVersions from '~/lib/minecraftVersions.json';
import type { ModLoader } from '~/lib/extra.types';

import Head from 'next/head';
import BackLink from '~/components/BackLink';
import NewSubmitButton from '~/components/NewSubmitButton';

const FeriumImportPage: NextPage = () => {
  const [title, setTitle] = useState('');
  const [gameVersion, setGameVersion] = useState(minecraftVersions[0]);
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

      <BackLink href="/new" />

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

        <NewSubmitButton disabled={submitting} />
      </form>
    </div>
  );
};

export default FeriumImportPage;
