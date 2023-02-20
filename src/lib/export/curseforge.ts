import type { ExportReturnData, ProviderSpecificOptions } from './types';
import type { CurseForgeVersion } from '~/types/curseforge';

export const callCurseForgeAPI = async ({
  id,
  gameVersions,
  loader,
}: ProviderSpecificOptions) => {
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
      gameVersions[0]
    )}&modLoaderType=${modLoaderTypeCringe}`,
    {
      headers: { 'x-api-key': API_KEY },
    }
  );

  if (res.status === 404) {
    return null;
  }

  const data = (await res
    .json()
    .then((json) => json.data)) as CurseForgeVersion[];

  return data;
};

export const getCFDownload = async ({
  id,
  gameVersions,
  loader,
  name,
}: ProviderSpecificOptions): Promise<ExportReturnData> => {
  const data = await callCurseForgeAPI({ id, gameVersions, loader, name });

  if (!data) {
    return [{ error: 'notfound', name, id }];
  }

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
      url: latest.downloadUrl,
      type: 'direct',
      fileSize: latest.fileLength,
      sha1: latest.hashes.filter((k) => k.algo === 1)[0].value,
      projectId: latest.id,
      fileId: latest.modId,
      displayName: latest.displayName ?? latest.fileName,
    },
  ];
};
