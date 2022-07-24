export interface CurseForgeProject {
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

  latestFiles: CurseForgeVersion[];

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

export interface CurseForgeVersion {
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
}

export interface CurseForgeSearchResult {
  data: CurseForgeProject[];

  pagination: {
    index: number;
    pageSize: number;
    resultCount: number;
    totalCount: number;
  };
}
