import type { ExportReturnData, ProviderSpecificOptions } from './types';

type NetworkResult = {
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
    gameVersionReleaseDate: '2019-08-24T14:15:22Z';
    gameVersionTypeId: number;
  }[];

  dependencies: {
    modId: number;
    relationType: number;
  }[];

  exposeAsAlternative: boolean | null;
  parentProjectFileId: number | null;
  alternateFileId: number | null;
  isServerPack: boolean | null;
  serverPackFileId: number | null;
  fileFingerprint: number;

  modules: {
    name: string;
    fingerprint: number;
  }[];
}[];

export const getCFDownload = async ({
  id,
  gameVersion,
  loader,
  name,
}: ProviderSpecificOptions): Promise<ExportReturnData> => {
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

  const res = await fetch(
    `https://api.curseforge.com/v1/mods/${id}/files?gameVersion=${encodeURIComponent(
      gameVersion
    )}&modLoaderType=${modLoaderTypeCringe}`,
    {
      headers: { 'x-api-key': API_KEY },
    }
  );

  if (res.status === 404) {
    return [{ error: 'notfound', name, id }];
  }

  const data = (await res.json().then((json) => json.data)) as NetworkResult;

  let latest = data.filter((v) => v.releaseType === 1)[0];
  if (!latest) latest = data.filter((v) => v.releaseType === 2)[0];
  if (!latest) latest = data.filter((v) => v.releaseType === 3)[0];

  if (!latest) return [{ error: 'notfound', name, id }];
  if (!latest.isAvailable) return [{ error: 'unavailable', name, id }];

  return [
    {
      provider: 'curseforge',
      name: latest.fileName,
      id,
      url: `/api/cursed?url=${encodeURIComponent(latest.downloadUrl)}`,
      type: 'direct',
      fileSize: latest.fileLength,
    },
  ];
};
