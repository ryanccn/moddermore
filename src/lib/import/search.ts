import * as v from "valibot";

import minecraftVersions from "../minecraftVersions.json";

import type { CurseForgeSearchResult } from "~/types/curseforge";
import { ModLoader, type RichMod } from "~/types/moddermore";
import type { ModrinthSearchResult } from "~/types/modrinth";

import { remoteFetch } from "../utils/remoteFetch";

export const optionsZ = v.object({
  platform: v.union([v.literal("modrinth"), v.literal("curseforge")]),
  query: v.string(),
  loader: ModLoader,
  gameVersion: v.string(),
});

type Options = v.Input<typeof optionsZ>;

export const search = async ({ platform, query, loader, gameVersion }: Options): Promise<RichMod[]> => {
  if (platform === "modrinth") {
    const compatGameVersions = minecraftVersions.filter((a) =>
      a.startsWith(gameVersion.split(".").slice(0, 2).join(".")),
    );

    const data = await remoteFetch(
      `https://api.modrinth.com/v2/search?query=${encodeURIComponent(query)}&facets=${encodeURIComponent(
        JSON.stringify([
          [`project_type:mod`],
          compatGameVersions.map((a) => `versions:${a}`),
          loader === "quilt"
            ? ["categories:fabric", "categories:quilt"]
            : loader === "neoforge"
            ? ["categories:neoforge", "categories:forge"]
            : [`categories:${loader}`],
        ]),
      )}`,
    ).then(async (r) => {
      if (!r.ok) throw new Error(await r.text());
      return r.json() as Promise<ModrinthSearchResult>;
    });

    return data.hits.map((rawMod) => ({
      id: rawMod.project_id,
      href: `https://modrinth.com/mod/${rawMod.slug}`,
      name: rawMod.title,
      provider: "modrinth",
      description: rawMod.description,
      downloads: rawMod.downloads,
      iconUrl: rawMod.icon_url,
    }));
  } else if (platform === "curseforge") {
    const API_KEY = process.env.NEXT_PUBLIC_CURSEFORGE_API_KEY;
    if (!API_KEY) throw new Error("No NEXT_PUBLIC_CURSEFORGE_API_KEY defined!");

    const modLoaderType =
      loader === "forge" || loader === "neoforge" ? 1 : loader === "fabric" ? 4 : loader === "quilt" ? 5 : -1;

    const data = await remoteFetch(
      `https://api.curseforge.com/v1/mods/search?gameId=432&classId=6&pageSize=10&sortField=2&sortOrder=desc&searchFilter=${encodeURIComponent(
        query,
      )}&modLoaderType=${modLoaderType}&gameVersion=${encodeURIComponent(gameVersion)}`,
      { headers: { "x-api-key": API_KEY } },
    ).then(async (r) => {
      if (!r.ok) throw new Error(await r.text());
      return r.json() as Promise<CurseForgeSearchResult>;
    });

    return data.data.map((rawMod) => ({
      id: `${rawMod.id}`,
      href: `https://curseforge.com/minecraft/mc-mods/${rawMod.slug}`,
      iconUrl: rawMod.logo.thumbnailUrl ?? undefined,
      provider: "curseforge",
      name: rawMod.name,
      description: rawMod.summary,
      downloads: rawMod.downloadCount,
    }));
  }

  return [];
};
