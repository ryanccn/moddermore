import { useCallback, useState } from "react";
import { search } from "~/lib/import/search";

import { SearchIcon } from "lucide-react";
import { RichModDisplay } from "./RichModDisplay";

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../shadcn/select";
import { Input } from "../shadcn/input";
import { Spinner } from "../shadcn/spinner";
import { Button } from "../shadcn/button";

import type { Mod, ModLoader, RichMod } from "~/types/moddermore";

const SEARCH_PROVIDERS = [
  { label: "Modrinth", value: "modrinth" },
  { label: "CurseForge", value: "curseforge" },
];

interface Props {
  modLoader: ModLoader;
  gameVersion: string;
  existing: Mod[];
  onAdd: (mod: RichMod) => void | Promise<void>;
}

const Search = ({ modLoader, gameVersion, existing, onAdd }: Props) => {
  const [searchProvider, setSearchProvider] = useState("modrinth");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<RichMod[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const updateSearch = useCallback(() => {
    setIsSearching(true);
    search({
      platform: searchProvider as "modrinth" | "curseforge",
      query: searchQuery,
      loader: modLoader,
      gameVersion: gameVersion,
    })
      .then((res) => {
        setSearchResults(res);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setIsSearching(false);
      });
  }, [searchProvider, searchQuery, modLoader, gameVersion]);

  return (
    <div className="mb-4 flex w-full flex-col gap-y-4">
      <div className="mt-10 flex w-full items-center justify-start gap-x-2">
        <Select
          name="searchProvider"
          value={searchProvider}
          aria-label="Select a provider to search from"
          onValueChange={(value) => {
            setSearchProvider(value);
          }}
          disabled={isSearching}
        >
          <SelectTrigger className="w-40 flex-grow-0">
            <SelectValue placeholder="Search provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {SEARCH_PROVIDERS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Input
          type="text"
          name="search-bar"
          className="flex-grow"
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
            if (e.key === "Enter") {
              e.preventDefault();
              updateSearch();
            }
          }}
        />

        <Button type="button" onClick={updateSearch} disabled={isSearching}>
          {isSearching ? <Spinner /> : <SearchIcon />}
          <span>Search</span>
        </Button>
      </div>

      {searchResults.length > 0 && (
        <ul className="flex flex-col gap-y-2">
          {searchResults.map((res, idx) =>
            existing && existing.some((m) => m.id === res.id && m.provider === res.provider) ? null : (
              <RichModDisplay
                data={res}
                key={res.id}
                buttonType="add"
                onClick={() => {
                  void onAdd(res);
                }}
                onVersion={(version, name) => {
                  if (version) {
                    const workingCopy = [...searchResults];
                    workingCopy[idx].version = version;
                    if (name) workingCopy[idx].cachedVersionName = name;
                    setSearchResults(workingCopy);
                  }
                }}
                parent={{
                  gameVersion,
                  modloader: modLoader,
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
