import JSZip from "jszip";

import type { CurseForgeVersion } from "~/types/curseforge";
import type { Mod } from "~/types/moddermore";
import type { ModrinthVersion } from "~/types/modrinth";
import type { SetStateFn } from "~/types/react";

import { clientPLimit } from "../utils/concurrency";
import { remoteFetch } from "../utils/remoteFetch";
import { curseforgeHash, modrinthHash } from "./hash";

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
  f: JSZip;
  setProgress: SetStateFn<{
    value: number;
    max: number;
  }>;
}

export const parseMod = async (file: Uint8Array): Promise<Mod | null> => {
  const mrHash = await modrinthHash(file);
  const mrRes = await remoteFetch(`https://api.modrinth.com/v2/version_file/${mrHash}?algorithm=sha512`);

  if (mrRes.ok) {
    const mrData = (await mrRes.json()) as ModrinthVersion;
    return {
      id: mrData.project_id,
      provider: "modrinth",
      version: mrData.id,
    };
  }

  const cfHash = curseforgeHash(file);
  const cfRes = await remoteFetch("https://api.curseforge.com/v1/fingerprints", {
    method: "POST",
    body: JSON.stringify({ fingerprints: [cfHash] }),
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.NEXT_PUBLIC_CURSEFORGE_API_KEY ?? "",
    },
  });

  if (cfRes.ok) {
    const cfData = (await cfRes.json()) as CurseForgeSpecialtyResponse;

    if (cfData.data.exactMatches.length === 0) return null;
    const file = cfData.data.exactMatches[0].file;

    return {
      id: `${file.modId}`,
      provider: "curseforge",
      version: `${file.id}`,
    };
  }

  return null;
};

export const parseModFolder = async ({ f, setProgress }: InputData) => {
  const mods = Object.keys(f.files).filter(
    (name) =>
      name.endsWith(".jar") &&
      !name.includes("__MACOSX") && // some macOS zip stuff
      !name.includes(".old") && // ferium
      !name.endsWith(".disabled") && // disabled mods
      !f.files[name].dir,
  );

  const ret: (Mod | null)[] = [];
  setProgress({ value: 0, max: mods.length });

  const resolveLimit = clientPLimit();

  await Promise.all(
    mods.map((mod) =>
      resolveLimit(async () => {
        try {
          const modFile = await f.files[mod].async("uint8array");
          ret.push(await parseMod(modFile));
        } catch (error) {
          console.error(error);
        }

        setProgress((oldVal) => ({ value: oldVal.value + 1, max: oldVal.max }));
      }),
    ),
  );

  return ret;
};
