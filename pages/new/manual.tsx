import type { NextPage } from 'next';
import { type FormEventHandler, useState, useCallback } from 'react';
import type { RichMod, ModLoader } from '~/lib/extra.types';

import minecraftVersions from '~/lib/minecraftVersions.json';
import { search } from '~/lib/search';

import UploadIcon from '@heroicons/react/outline/UploadIcon';

import { useRouter } from 'next/router';
import Head from 'next/head';

import RichModDisplay from '~/components/RichModDisplay';
import BackToNewButton from '~/components/BackToNewButton';

const NewList: NextPage = () => {
  const [title, setTitle] = useState('');
  const [gameVersion, setGameVersion] = useState(minecraftVersions[0]);
  const [modLoader, setModLoader] = useState<ModLoader>('fabric');

  const [searchProvider, setSearchProvider] = useState('modrinth');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RichMod[]>([]);

  const [inputMods, setInputMods] = useState<RichMod[]>([]);

  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  const submitHandle: FormEventHandler = (e) => {
    e.preventDefault();

    setSubmitting(true);

    fetch('/api/new', {
      method: 'POST',
      body: JSON.stringify({
        title: title,
        mods: inputMods,
        gameVersion,
        modloader: modLoader,
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

  const updateSearch = useCallback(() => {
    search({
      platform: searchProvider as 'modrinth' | 'curseforge',
      query: searchQuery,
      loader: modLoader,
      gameVersion: gameVersion,
    }).then((res) => {
      setSearchResults(res);
      console.log('Search results updated');
    });
  }, [searchProvider, searchQuery, modLoader, gameVersion]);

  return (
    <div className="layout">
      <Head>
        <title>Manual creation / Moddermore</title>
      </Head>

      <BackToNewButton />

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

        <div className="flex w-full flex-col space-y-4">
          <div className="!mt-10 flex w-full items-center justify-start space-x-2">
            <select
              name="searchProvider"
              value={searchProvider}
              className="moddermore-input flex-grow-0"
              onChange={(e) => {
                setSearchProvider(e.target.value);
              }}
            >
              <option value="modrinth">Modrinth</option>
              <option value="curseforge">CurseForge</option>
            </select>

            <input
              type="text"
              name="search-bar"
              className="moddermore-input flex-grow"
              placeholder="Search for mods"
              minLength={1}
              // debounceTimeout={1000}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  console.log('Enter key triggered');
                  updateSearch();
                }
              }}
            />

            <button
              type="button"
              className="primaryish-button"
              onClick={updateSearch}
            >
              Search
            </button>
          </div>

          {searchResults.length > 0 && (
            <ul className="flex flex-col space-y-2">
              {searchResults.map((res) =>
                inputMods.filter(
                  (m) => m.id === res.id && m.provider === res.provider
                ).length > 0 ? (
                  <></>
                ) : (
                  <RichModDisplay
                    data={res}
                    key={res.id}
                    onClick={() => {
                      setInputMods([...inputMods, res]);
                    }}
                  />
                )
              )}
            </ul>
          )}
        </div>

        <h2 className="text-sm font-bold uppercase text-zinc-600 dark:text-zinc-300">
          Added mods
        </h2>
        <ul>
          {inputMods.map((mod) => (
            <li key={mod.id}>
              <RichModDisplay data={mod} />
            </li>
          ))}
        </ul>

        {/* {inputMods.map((_, idx) => {
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
        </button> */}

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
