import { z } from 'zod';

import minecraftVersions from '../minecraftVersions.json';

import type { RichMod } from '~/types/moddermore';
import type { ModrinthSearchResult } from '~/types/modrinth';
import type { CurseForgeSearchResult } from '~/types/curseforge';

export const optionsZ = z.object({
  platform: z.union([z.literal('modrinth'), z.literal('curseforge')]),
  query: z.string(),
  loader: z.union([
    z.literal('quilt'),
    z.literal('fabric'),
    z.literal('forge'),
  ]),
  gameVersion: z.string(),
});

type Options = z.infer<typeof optionsZ>;

export const search = async ({
  platform,
  query,
  loader,
  gameVersion,
}: Options): Promise<RichMod[]> => {
  if (platform === 'modrinth') {
    const compatGameVersions = minecraftVersions.filter((a) =>
      a.startsWith(gameVersion.split('.').slice(0, 2).join('.'))
    );

    const data = await fetch(
      `https://api.modrinth.com/v2/search?query=${encodeURIComponent(
        query
      )}&facets=${encodeURIComponent(
        JSON.stringify([
          [`project_type:mod`],
          compatGameVersions.map((a) => `versions:${a}`),
          loader === 'quilt'
            ? ['categories:fabric', 'categories:quilt']
            : [`categories:${loader}`],
        ])
      )}`
    ).then(async (r) => {
      if (!r.ok) throw new Error(await r.text());
      return r.json() as Promise<ModrinthSearchResult>;
    });

    return data.hits.map((rawMod) => ({
      id: rawMod.project_id,
      href: `https://modrinth.com/mod/${rawMod.slug}`,
      name: rawMod.title,
      provider: 'modrinth',
      description: rawMod.description,
      iconUrl: rawMod.icon_url,
    }));
  } else if (platform === 'curseforge') {
    const API_KEY = process.env.NEXT_PUBLIC_CURSEFORGE_API_KEY;
    if (!API_KEY) throw new Error('No NEXT_PUBLIC_CURSEFORGE_API_KEY defined!');

    const modLoaderTypeCringe =
      loader === 'forge'
        ? 1
        : loader === 'fabric'
        ? 4
        : loader === 'quilt'
        ? 5
        : -1;

    const data = await fetch(
      `https://api.curseforge.com/v1/mods/search?gameId=432&classId=6&pageSize=10&sortField=2&sortOrder=desc&searchFilter=${encodeURIComponent(
        query
      )}&modLoaderType=${modLoaderTypeCringe}&gameVersion=${encodeURIComponent(
        gameVersion
      )}`,
      { headers: { 'x-api-key': API_KEY } }
    ).then(async (r) => {
      if (!r.ok) throw new Error(await r.text());
      return r.json() as Promise<CurseForgeSearchResult>;
    });

    return data.data.map((rawMod) => ({
      id: `${rawMod.id}`,
      href: `https://curseforge.com/minecraft/mc-mods/${rawMod.slug}`,
      iconUrl: rawMod.logo.thumbnailUrl ?? undefined,
      provider: 'curseforge',
      name: rawMod.name,
      description: rawMod.summary,
    }));
  }

  return [];
};
