import type { NextPage } from 'next';
import { type FormEventHandler, useState } from 'react';
import type { Mod, ModProvider } from '~/lib/extra.types';

import PlusIcon from '@heroicons/react/solid/PlusIcon';
import XIcon from '@heroicons/react/solid/XIcon';
import UploadIcon from '@heroicons/react/outline/UploadIcon';
import { useRouter } from 'next/router';

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

    fetch('/api/create', {
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
      <form
        className="flex flex-col space-y-2 items-start"
        onSubmit={submitHandle}
      >
        <input
          name="title"
          value={title}
          className="title focus:outline-none"
          placeholder="Enter the title..."
          onChange={(e) => {
            setTitle(e.target.value);
          }}
        />

        {inputMods.map((_, idx) => {
          return (
            <div
              className="w-full bg-transparent hover:bg-gray-50 transition-colors rounded-md flex items-center space-x-2 p-5"
              key={`mod-form-group-${idx}`}
            >
              <select
                name={`mod-${idx}-provider`}
                value={inputMods[idx].provider}
                className="moddermore input"
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
                className="moddermore input flex-grow"
                placeholder="ID of the mod"
                onChange={(e) => {
                  const newMod = [...inputMods];
                  newMod[idx].id = e.target.value;
                  setInputMods(newMod);
                }}
              />
              <button
                className="inline-block p-1 text-red-500 hover:text-white hover:bg-red-400 rounded-full"
                onClick={() => {
                  const newMod = [...inputMods];
                  newMod.splice(idx, 1);
                  setInputMods(newMod);
                }}
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          );
        })}

        <button
          type="button"
          className="bg-gray-50 hover:bg-gray-100 rounded-md transition-all w-full flex space-x-3 justify-center items-center py-2 px-3 focus:outline-none focus:ring"
          onClick={() => {
            setInputMods([...inputMods, { id: '', provider: 'modrinth' }]);
          }}
        >
          <PlusIcon className="block w-5 h-5" />
          <span>Add mod</span>
        </button>

        <button
          type="submit"
          className="text-white !mt-14 bg-indigo-500 hover:bg-indigo-400 rounded-md transition-all flex space-x-3 justify-center items-center py-3 px-4 font-medium text-sm focus:outline-none focus:ring disabled:opacity-75"
          disabled={submitting}
        >
          <UploadIcon className="block w-5 h-5" />
          <span>Submit</span>
        </button>
      </form>
    </div>
  );
};

export default NewList;
