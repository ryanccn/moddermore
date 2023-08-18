import { useCallback, useState } from 'react';
import { search } from '~/lib/import/search';

import { Button } from '../ui/Button';
import { Spinner } from './Spinner';
import { SearchIcon } from 'lucide-react';
import { RichModDisplay } from './RichModDisplay';

import type { Mod, ModLoader, RichMod } from '~/types/moddermore';

interface Props {
  modLoader: ModLoader;
  gameVersion: string;
  existing: Mod[];
  onAdd: (mod: RichMod) => void | Promise<void>;
}

const Search = ({ modLoader, gameVersion, existing, onAdd }: Props) => {
  const [searchProvider, setSearchProvider] = useState('modrinth');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RichMod[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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
            <Spinner className="block w-5 h-5" />
          ) : (
            <SearchIcon className="block w-5 h-5" />
          )}
          <span>Search</span>
        </Button>
      </div>

      {searchResults.length > 0 && (
        <ul className="flex flex-col gap-y-2">
          {searchResults.map((res) =>
            existing &&
            existing.some(
              (m) => m.id === res.id && m.provider === res.provider,
            ) ? null : (
              <RichModDisplay
                data={res}
                key={res.id}
                buttonType="add"
                onClick={() => {
                  onAdd(res);
                }}
              />
            ),
          )}
        </ul>
      )}
    </div>
  );
};

export { Search };
