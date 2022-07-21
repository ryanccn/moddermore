import type { RichMod } from './extra.types';

// type Side = 'required' | 'optional' | 'unsupported';

interface NetworkResult {
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
  isFeatured: boolean;
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
  authors: {
    id: number;
    name: string;
    url: string;
  }[];

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
    releaseType: 1;
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
}

export const getInfo = async (id: string): Promise<RichMod | null> => {
  const API_KEY = process.env.CURSEFORGE_API_KEY;
  if (!API_KEY) throw new Error('No CURSEFORGE_API_KEY defined!');

  const res = await fetch(`https://api.curseforge.com/v1/mods/${id}`, {
    headers: { 'x-api-key': API_KEY },
  });

  if (res.status === 404) {
    return null;
  }

  const data = (await res.json().then((json) => json.data)) as NetworkResult;

  return {
    id,
    href: `https://curseforge.com/minecraft/mc-mods/${data.slug}`,
    iconUrl: data.logo.thumbnailUrl ?? undefined,
    provider: 'curseforge',
    name: data.name,
    description: data.summary,
  };
};
