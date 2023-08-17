import type { NextPage } from 'next';

import { useCallback, useState } from 'react';

import { useSession } from 'next-auth/react';

import { DashboardLayout } from '~/components/layout/DashboardLayout';
import { ModListInList } from '~/components/partials/ModListInList';
import { Button } from '~/components/ui/Button';

import { toast } from 'react-hot-toast';
import type { ModListWithExtraData } from '~/types/moddermore';

const SearchPage: NextPage = () => {
  useSession({ required: true });
  const [query, setQuery] = useState('');
  const [lists, setLists] = useState<ModListWithExtraData[]>([]);

  const updateSearch = useCallback(() => {
    fetch('/api/search', {
      method: 'POST',
      body: JSON.stringify({ query }),
      headers: { 'content-type': 'application/json' },
    })
      .then((a) => a.json() as Promise<ModListWithExtraData[]>)
      .then(setLists)
      .catch(() => {
        toast.error('Failed to fetch lists!');
      });
  }, [query]);

  return (
    <DashboardLayout title="Search">
      <div className="flex flex-col gap-y-8 px-6 items-stretch w-full">
        <div className="mb-12 flex w-full items-center justify-start gap-x-2">
          <input
            type="text"
            name="search-bar"
            className="mm-input flex-grow"
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

          <Button type="button" onClick={updateSearch}>
            Search
          </Button>
        </div>

        {lists.length > 0 ? (
          <ul className="grid h-fit w-full grid-cols-1 gap-4 lg:grid-cols-3">
            {lists.map((list) => (
              <ModListInList listWithExtra={list} key={list.id} />
            ))}
          </ul>
        ) : null}
      </div>
    </DashboardLayout>
  );
};

export default SearchPage;
