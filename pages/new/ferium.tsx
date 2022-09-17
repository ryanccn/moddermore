import type { NextPage } from 'next';
import { type FormEventHandler, useState } from 'react';

import { useRouter } from 'next/router';

import { parseFerium } from '~/lib/import/ferium';
import minecraftVersions from '~/lib/minecraftVersions.json';
import type { ModLoader } from '~/types/moddermore';

import { GlobalLayout } from '~/components/layout/GlobalLayout';
import { NewSubmitButton } from '~/components/partials/NewSubmitButton';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

const FeriumImportPage: NextPage = () => {
  const sess = useSession({ required: true });

  const [title, setTitle] = useState('');
  const [gameVersion, setGameVersion] = useState(minecraftVersions[0]);
  const [modLoader, setModLoader] = useState<ModLoader>('quilt');
  const [feriumCopyPaste, setFeriumCopyPaste] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  const submitHandle: FormEventHandler = async (e) => {
    e.preventDefault();
    if (!sess.data) return;

    setSubmitting(true);

    const a = await fetch('/api/create', {
      method: 'POST',
      body: JSON.stringify({
        title,
        gameVersion,
        modloader: modLoader,
        mods: parseFerium(feriumCopyPaste),
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
    <GlobalLayout title="Ferium import" displayTitle={false}>
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

        <textarea
          name="ferium-copy-paste"
          value={feriumCopyPaste}
          className="moddermore-input min-h-[10rem] w-full resize-y font-mono"
          placeholder="Paste the output of `ferium list` here."
          aria-label="The output of `ferium list`"
          required
          onChange={(e) => {
            setFeriumCopyPaste(e.target.value);
          }}
        />

        <NewSubmitButton disabled={sess.status === 'loading' || submitting} />
      </form>
    </GlobalLayout>
  );
};

export default FeriumImportPage;
