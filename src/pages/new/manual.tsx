import type { NextPage } from 'next';
import { type FormEventHandler, useState, useCallback } from 'react';
import type { RichMod, ModLoader } from '~/types/moddermore';

import minecraftVersions from '~/lib/minecraftVersions.json';
import { search } from '~/lib/import/search';
import { richModToMod } from '~/lib/db/conversions';

import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

import { GlobalLayout } from '~/components/layout/GlobalLayout';
import { RichModDisplay } from '~/components/partials/RichModDisplay';
import { NewSubmitButton } from '~/components/partials/NewSubmitButton';
import { Button } from '~/components/ui/Button';

import { Spinner } from '~/components/partials/Spinner';
import { SearchIcon } from 'lucide-react';

import toast from 'react-hot-toast';

const ManualImportPage: NextPage = () => {
  const session = useSession({ required: true });

  const [title, setTitle] = useState('');
  const [gameVersion, setGameVersion] = useState(minecraftVersions[0]);
  const [modLoader, setModLoader] = useState<ModLoader>('quilt');

  const [searchProvider, setSearchProvider] = useState('modrinth');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RichMod[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [inputMods, setInputMods] = useState<RichMod[]>([]);

  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  const submitHandle: FormEventHandler = useCallback(
    async (e) => {
      e.preventDefault();
      if (!session.data) return;

      setSubmitting(true);

      const res = await fetch('/api/list/create', {
        method: 'POST',
        body: JSON.stringify({
          title,
          gameVersion,
          modloader: modLoader,
          mods: inputMods.map((elem) => richModToMod(elem)),
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
    [gameVersion, inputMods, modLoader, router, session.data, title],
  );

  const updateSearch = useCallback(() => {
    setIsSearching(true);
    search({
      platform: searchProvider as 'modrinth' | 'curseforge',
      query: searchQuery,
      loader: modLoader,
      gameVersion: gameVersion,
    })
      .then((res) => {
        setSearchResults(res);
      })
      .finally(() => {
        setIsSearching(false);
      });
  }, [searchProvider, searchQuery, modLoader, gameVersion]);

  return (
    <GlobalLayout title="Manual creation" displayTitle={false}>
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

        <div className="flex w-full flex-col gap-y-4">
          <div className="mt-10 flex w-full items-center justify-start gap-x-2">
            <select
              name="searchProvider"
              value={searchProvider}
              className="mm-input flex-grow-0"
              aria-label="Select a provider to search from"
              onChange={(e) => {
                setSearchProvider(e.target.value);
              }}
              disabled={isSearching}
            >
              <option value="modrinth">Modrinth</option>
              <option value="curseforge">CurseForge</option>
            </select>

            <input
              type="text"
              name="search-bar"
              className="mm-input flex-grow"
              placeholder="Search for mods"
              role="search"
              aria-label="Search for mods"
              minLength={1}
              value={searchQuery}
              disabled={isSearching}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  updateSearch();
                }
              }}
            />

            <Button type="button" onClick={updateSearch} disabled={isSearching}>
              {isSearching ? (
                <Spinner className="block w-4 h-4" />
              ) : (
                <SearchIcon className="block w-4 h-4" />
              )}
              <span>Search</span>
            </Button>
          </div>

          {searchResults.length > 0 && (
            <ul className="flex flex-col gap-y-2">
              {searchResults.map((res) =>
                inputMods.some(
                  (m) => m.id === res.id && m.provider === res.provider,
                ) ? null : (
                  <RichModDisplay
                    data={res}
                    key={res.id}
                    buttonType="add"
                    onClick={() => {
                      setInputMods([...inputMods, res]);
                    }}
                  />
                ),
              )}
            </ul>
          )}
        </div>

        <h2 className="mt-12 text-sm font-bold uppercase text-neutral-800 dark:text-neutral-200">
          Added mods
        </h2>
        <ul className="flex w-full flex-col gap-y-2">
          {inputMods.map((mod) => (
            <li key={mod.id}>
              <RichModDisplay
                data={mod}
                buttonType="delete"
                onClick={() => {
                  setInputMods(inputMods.filter((a) => a.id !== mod.id));
                }}
              />
            </li>
          ))}
        </ul>

        <NewSubmitButton
          submitting={submitting}
          disabled={session.status === 'loading' || submitting}
        />
      </form>
    </GlobalLayout>
  );
};

export default ManualImportPage;
