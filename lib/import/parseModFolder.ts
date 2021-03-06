import { loadAsync } from 'jszip';

import type { ModrinthVersion } from '~/types/modrinth';
import type { CurseForgeVersion } from '~/types/curseforge';
import type { Mod } from '~/types/moddermore';
import type { Dispatch, SetStateAction } from 'react';

import { curseforgeHash, modrinthHash } from './hash';
import pLimit from 'p-limit';

interface CurseForgeSpecialtyResponse {
  data: {
    isCacheBuilt: boolean;
    exactMatches: {
      id: number;
      file: CurseForgeVersion;
      latestFiles: CurseForgeVersion[];
    }[];
  };
}

interface InputData {
  f: Uint8Array;
  setProgress: Dispatch<
    SetStateAction<{
      value: number;
      max: number;
    }>
  >;
}

export const parseMod = async (file: Uint8Array): Promise<Mod | null> => {
  const mrHash = await modrinthHash(file);
  const mrRes = await fetch(
    `https://api.modrinth.com/v2/version_file/${mrHash}?algorithm=sha512`,
    { headers: { 'User-Agent': 'Moddermore/noversion' } }
  );

  if (mrRes.ok) {
    const mrData = (await mrRes.json()) as ModrinthVersion;
    return { id: mrData.project_id, provider: 'modrinth' };
  }

  console.log('Modrinth not found, moving to CF');

  const cfHash = await curseforgeHash(file);
  const cfRes = await fetch('https://api.curseforge.com/v1/fingerprints', {
    method: 'POST',
    body: JSON.stringify({ fingerprints: [cfHash] }),
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.NEXT_PUBLIC_CURSEFORGE_API_KEY ?? '',
    },
  });

  if (cfRes.ok) {
    const cfData = (await cfRes.json()) as CurseForgeSpecialtyResponse;
    return {
      id: `${cfData.data.exactMatches[0].file.modId}`,
      provider: 'curseforge',
    };
  }

  return null;
};

export const parseModFolder = async ({ f, setProgress }: InputData) => {
  const zipFile = await loadAsync(f);
  const mods = Object.keys(zipFile.files).filter(
    (name) =>
      name.endsWith('.jar') &&
      !name.includes('__MACOSX') && // some macOS zip stuff
      !name.includes('.old') && // ferium
      !zipFile.files[name].dir
  );

  let ret: (Mod | null)[] = [];
  setProgress({ value: 0, max: mods.length });

  const resolveLimit = pLimit(4);

  await Promise.all(
    mods.map((mod) =>
      resolveLimit(async () => {
        try {
          const modFile = await zipFile.files[mod].async('uint8array');
          ret = [...ret, await parseMod(modFile)];
        } catch (e) {
          console.error(e);
        }

        setProgress((oldVal) => ({ value: oldVal.value + 1, max: oldVal.max }));
      })
    )
  );

  return ret;
};
