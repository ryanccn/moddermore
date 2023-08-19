import type { NextPage } from 'next';

import { useCallback, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';

import { GlobalLayout } from '~/components/layout/GlobalLayout';
import { ModListInList } from '~/components/partials/ModListInList';
import { Button } from '~/components/ui/Button';
import { Spinner } from '~/components/partials/Spinner';
import { SearchIcon } from 'lucide-react';

import { toast } from 'react-hot-toast';
import type { ModListWithExtraData } from '~/types/moddermore';

const SearchPage: NextPage = () => {
  const session = useSession();

  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [lists, setLists] = useState<ModListWithExtraData[]>([]);

  const isAdmin = useMemo(
    () => session.data?.extraProfile.isAdmin === true,
    [session.data],
  );

  const updateSearch = useCallback(() => {
    setSearching(true);

    fetch('/api/search', {
      method: 'POST',
      body: JSON.stringify({ query }),
      headers: { 'content-type': 'application/json' },
    })
      .then((a) => a.json() as Promise<ModListWithExtraData[]>)
      .then(setLists)
      .catch(() => {
        toast.error('Failed to fetch lists!');
      })
      .finally(() => {
        setSearching(false);
      });
  }, [query]);

  return (
    <GlobalLayout title="Search" className="min-h-screen">
      <div className="mb-12 flex w-full items-center justify-start gap-x-2">
        <input
          type="text"
          name="search-bar"
          className="mm-input flex-grow"
          placeholder={isAdmin ? 'Search all lists' : 'Search for public lists'}
          role="search"
          aria-label={isAdmin ? 'Search all lists' : 'Search for public lists'}
          minLength={1}
          value={query}
          disabled={searching}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              updateSearch();
            }
          }}
        />

        <Button type="button" onClick={updateSearch} disabled={searching}>
          {searching ? (
            <Spinner className="w-5 h-5" />
          ) : (
            <SearchIcon className="block w-5 h-5" />
          )}
          <span>Search</span>
        </Button>
      </div>

      {lists.length > 0 ? (
        <ul className="flex flex-col gap-y-8">
          {lists.map((list) => (
            <ModListInList listWithExtra={list} key={list.id} />
          ))}
        </ul>
      ) : null}
    </GlobalLayout>
  );
};

export default SearchPage;
