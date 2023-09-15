import type { CurseForgeVersion } from "~/types/curseforge";
import type { ExportReturnData, ProviderSpecificOptions } from "./types";

import { fetchWithRetry } from "~/lib/fetchWithRetry";

export const callCurseForgeAPI = async ({ id, gameVersions, loader, version }: ProviderSpecificOptions) => {
  const API_KEY = process.env.NEXT_PUBLIC_CURSEFORGE_API_KEY;
  if (!API_KEY) throw new Error("No NEXT_PUBLIC_CURSEFORGE_API_KEY defined!");

  const modLoaderType = loader === "forge" ? 1 : loader === "fabric" ? 4 : loader === "quilt" ? 5 : -1;

  if (version) {
    const res = await fetchWithRetry(
      `https://api.curseforge.com/v1/mods/${encodeURIComponent(id)}/files/${encodeURIComponent(
        version,
      )}?gameVersion=${encodeURIComponent(gameVersions[0])}&modLoaderType=${modLoaderType}`,
      {
        headers: { "x-api-key": API_KEY },
      },
    );

    if (res.status === 404) return null;

    const data = (await res.json().then((json) => json.data)) as CurseForgeVersion;

    return [data];
  }

  const res = await fetchWithRetry(
    `https://api.curseforge.com/v1/mods/${id}/files?gameVersion=${encodeURIComponent(
      gameVersions[0],
    )}&modLoaderType=${modLoaderType}`,
    {
      headers: { "x-api-key": API_KEY },
    },
  );

  if (res.status === 404) return null;

  const data = (await res.json().then((json) => json.data)) as CurseForgeVersion[];

  return data;
};

export const getCFDownload = async ({
  id,
  gameVersions,
  loader,
  name,
  version,
}: ProviderSpecificOptions): Promise<ExportReturnData> => {
  const data = await callCurseForgeAPI({
    id,
    gameVersions,
    loader,
    name,
    version,
  });

  if (!data) {
    return [{ error: "notfound", name, id }];
  }

  let latest = data.find((v) => v.releaseType === 1);
  if (!latest) latest = data.find((v) => v.releaseType === 2);
  if (!latest) latest = data.find((v) => v.releaseType === 3);

  if (!latest) return [{ error: "notfound", name, id }];
  if (!latest.isAvailable) return [{ error: "unavailable", name, id }];

  return [
    {
      provider: "curseforge",
      name: latest.fileName,
      id,
      url: latest.downloadUrl,
      type: "direct",
      fileSize: latest.fileLength,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      sha1: latest.hashes.find((k) => k.algo === 1)!.value,
      projectId: latest.modId,
      fileId: latest.id,
      displayName: latest.displayName ?? latest.fileName,
    },
  ];
};
