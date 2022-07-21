import { z } from 'zod';
import type { RichMod } from '~/lib/extra.types';

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

interface ModrinthSearchResult {
  hits: {
    slug: string;
    title: string;
    description: string;
    categories: string[];
    project_type: 'mod';
    downloads: number;
    icon_url: string;
    project_id: string;
    author: string;
    versions: string[];
    follows: number;
    date_created: string;
    date_modified: string;
    latest_version: string;
    license: string;
    gallery: string[];
  }[];

  offset: number;
  limit: number;
  total_hits: number;
}

interface CurseForgeSearchResult {
  data: {
    id: number;
    gameId: number;
    name: string;
    slug: string;

    links: {
      websiteUrl: string;
      wikiUrl: string;
      issuesUrl: string;
      sourceUrl: string;
    };

    summary: string;
    status: number;
    downloadCount: number;
    isFeatured: true;

    primaryCategoryId: number;
    categories: {
      id: number;
      gameId: number;
      name: string;
      slug: string;
      url: string;
      iconUrl: string;
      dateModified: string;
      isClass: boolean;
      classId: number;
      parentCategoryId: number;
      displayIndex: number;
    }[];

    classId: number;

    authors: [
      {
        id: number;
        name: string;
        url: string;
      }
    ];

    logo: {
      id: number;
      modId: number;
      title: string;
      description: string;
      thumbnailUrl: string;
      url: string;
    };

    screenshots: {
      id: number;
      modId: number;
      title: string;
      description: string;
      thumbnailUrl: string;
      url: string;
    }[];

    mainFileId: number;
    latestFiles: {
      id: number;
      gameId: number;
      modId: number;
      isAvailable: boolean;
      displayName: string;
      fileName: string;
      releaseType: number;
      fileStatus: number;
      hashes: {
        value: string;
        algo: number;
      }[];
      fileDate: string;
      fileLength: number;
      downloadCount: number;
      downloadUrl: string;
      gameVersions: string[];
      sortableGameVersions: {
        gameVersionName: string;
        gameVersionPadded: string;
        gameVersion: string;
        gameVersionReleaseDate: string;
        gameVersionTypeId: number;
      }[];
      dependencies: {
        modId: number;
        relationType: number;
      }[];
      exposeAsAlternative: boolean;
      parentProjectFileId: number;
      alternateFileId: number;
      isServerPack: boolean;
      serverPackFileId: number;
      fileFingerprint: number;
      modules: {
        name: string;
        fingerprint: number;
      }[];
    }[];

    latestFilesIndexes: {
      gameVersion: string;
      fileId: number;
      filename: string;
      releaseType: number;
      gameVersionTypeId: number;
      modLoader: number;
    }[];
    dateCreated: string;
    dateModified: string;
    dateReleased: string;
    allowModDistribution: boolean;
    gamePopularityRank: number;
    isAvailable: boolean;
    thumbsUpCount: number;
  }[];

  pagination: {
    index: number;
    pageSize: number;
    resultCount: number;
    totalCount: number;
  };
}

export const search = async ({
  platform,
  query,
  loader,
  gameVersion,
}: Options): Promise<RichMod[]> => {
  if (platform === 'modrinth') {
    const data = await fetch(
      `https://api.modrinth.com/v2/search?query=${encodeURIComponent(
        query
      )}&facets=${encodeURIComponent(
        `[["project_type:mod"],["versions:${gameVersion}"],["categories:${loader}"]]`
      )}`
    ).then(async (r) => {
      if (!r.ok) throw new Error(await r.text());
      return r.json() as Promise<ModrinthSearchResult>;
    });

    return data.hits.map((rawMod) => ({
      id: rawMod.project_id,
      href: `https://modrinth.com/mod/${rawMod.project_id}`,
      name: rawMod.title,
      provider: 'modrinth',
      description: rawMod.description,
      iconUrl: rawMod.icon_url,
    }));
  } else if (platform === 'curseforge') {
    const API_KEY = process.env.CURSEFORGE_API_KEY;
    if (!API_KEY) throw new Error('No CURSEFORGE_API_KEY defined!');

    const modLoaderTypeCringe =
      loader === 'forge'
        ? 1
        : loader === 'fabric'
        ? 4
        : loader === 'quilt'
        ? 5
        : -1;

    const data = await fetch(
      `https://api.curseforge.com/v1/mods/search?gameId=432&searchFilter=${encodeURIComponent(
        query
      )}&modLoaderType=${modLoaderTypeCringe}&gameVersion=${encodeURIComponent(
        gameVersion
      )}&classId=6&pageSize=10`,
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
