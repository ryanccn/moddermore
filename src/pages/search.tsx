import type { NextPage } from 'next';

import { useCallback, useState } from 'react';

import { useSession } from 'next-auth/react';

import { DashboardLayout } from '~/components/layout/DashboardLayout';
import { ModListInList } from '~/components/partials/ModListInList';

import { toast } from 'react-hot-toast';
import type { ModList } from '~/types/moddermore';

const SearchPage: NextPage = () => {
  useSession({ required: true });
  const [query, setQuery] = useState('');
  const [lists, setLists] = useState<ModList[]>([]);

  const updateSearch = useCallback(() => {
    fetch('/api/search', {
      method: 'POST',
      body: JSON.stringify({ query }),
      headers: { 'content-type': 'application/json' },
    })
      .then((a) => a.json() as Promise<ModList[]>)
      .then(setLists)
      .catch(() => {
        toast.error('Failed to fetch lists!');
      });
  }, [query]);

  return (
    <DashboardLayout title="Search">
      <div className="flex flex-col gap-y-8 items-stretch w-full">
        <div className="mb-12 flex w-full items-center justify-start gap-x-2">
          <input
            type="text"
            name="search-bar"
            className="moddermore-input flex-grow"
            placeholder="Search for public lists"
            role="search"
            aria-label="Search for public lists"
            minLength={1}
            value={query}
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

          <button
            type="button"
            className="primaryish-button"
            onClick={updateSearch}
          >
            Search
          </button>
        </div>

        {lists.length > 0 ? (
          <ul className="grid h-fit w-full grid-cols-1 gap-4 px-6 lg:grid-cols-3">
            {lists.map((list) => (
              <ModListInList list={list} key={list.id} />
            ))}
          </ul>
        ) : (
          <div className="rounded w-full h-fit m-6 bg-transparent font-medium px-2 py-16 text-center text-lg shadow dark:bg-neutral-800">
            No lists found!
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SearchPage;
