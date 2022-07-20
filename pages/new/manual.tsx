import type { NextPage } from 'next';
import { type FormEventHandler, useState } from 'react';
import type { Mod, ModProvider } from '~/lib/extra.types';

import PlusIcon from '@heroicons/react/solid/PlusIcon';
import XIcon from '@heroicons/react/solid/XIcon';
import UploadIcon from '@heroicons/react/outline/UploadIcon';
import { useRouter } from 'next/router';
import Head from 'next/head';

const NewList: NextPage = () => {
  const [title, setTitle] = useState('');
  const [inputMods, setInputMods] = useState<Mod[]>([
    { id: '', provider: 'modrinth' },
  ]);

  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  const submitHandle: FormEventHandler = (e) => {
    e.preventDefault();

    setSubmitting(true);

    fetch('/api/new', {
      method: 'POST',
      body: JSON.stringify({ title: title, mods: inputMods }),
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
        <title>Manual creation / Moddermore</title>
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

        {inputMods.map((_, idx) => {
          return (
            <div
              className="flex w-full items-center space-x-2 rounded-md bg-transparent p-5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
              key={`mod-form-group-${idx}`}
            >
              <select
                name={`mod-${idx}-provider`}
                value={inputMods[idx].provider}
                className="moddermore-input"
                onChange={(e) => {
                  const newMod = [...inputMods];
                  newMod[idx].provider = e.target.value as ModProvider;
                  setInputMods(newMod);
                }}
              >
                <option value="modrinth">Modrinth</option>
                <option value="curseforge">CurseForge</option>
                <option value="github">GitHub</option>
              </select>

              <input
                name={`mod-${idx}-id`}
                value={inputMods[idx].id}
                type="text"
                className="moddermore-input flex-grow"
                placeholder="ID of the mod"
                required
                onChange={(e) => {
                  const newMod = [...inputMods];
                  newMod[idx].id = e.target.value;
                  setInputMods(newMod);
                }}
              />
              <button
                className="inline-block rounded-full p-1 text-red-500 hover:bg-red-400 hover:text-white"
                onClick={() => {
                  const newMod = [...inputMods];
                  newMod.splice(idx, 1);
                  setInputMods(newMod);
                }}
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
          );
        })}

        <button
          type="button"
          className="flex w-full items-center justify-center space-x-3 rounded-md bg-zinc-50 py-2 px-3 transition-all hover:bg-zinc-100 focus:outline-none focus:ring dark:bg-zinc-800 dark:hover:bg-zinc-700"
          onClick={() => {
            setInputMods([...inputMods, { id: '', provider: 'modrinth' }]);
          }}
        >
          <PlusIcon className="block h-5 w-5" />
          <span>Add mod</span>
        </button>

        <button
          type="submit"
          className="primaryish-button !mt-14"
          disabled={submitting}
        >
          <UploadIcon className="block h-5 w-5" />
          <span>Submit</span>
        </button>
      </form>
    </div>
  );
};

export default NewList;
