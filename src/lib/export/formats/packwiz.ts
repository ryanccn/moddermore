import { type AnyJson, JsonMap, stringify } from "@iarna/toml";

import pLimit from "p-limit";
import { getSpecificList } from "~/lib/db";
import { sha512 } from "~/lib/sha512";
import {
  getLatestFabric,
  getLatestForge,
  getLatestNeoforge,
  getLatestQuilt,
} from "../upstream/loaderVersions";

import { getCFDownload } from "../upstream/curseforge";
import { getModrinthDownload } from "../upstream/modrinth";

import type { ModPwToml } from "~/types/packwiz";
import type { CurseForgeDownload, ModrinthDownload, ProviderSpecificOptions } from "../upstream/types";

export const getPackTOML = async (id: string) => {
  const list = await getSpecificList(id);

  if (!list) return null;

  const indexHash = await sha512((await getIndexTOML(id)) || "");

  return stringify({
    name: list.title,
    "pack-format": "packwiz:1.1.0",
    versions: {
      minecraft: list.gameVersion,
      ...(list.modloader === "fabric" ? { fabric: await getLatestFabric() } : {}),
      ...(list.modloader === "quilt" ? { quilt: await getLatestQuilt() } : {}),
      ...(list.modloader === "forge" ? { forge: await getLatestForge(list.gameVersion) } : {}),
      ...(list.modloader === "neoforge" ? { neoforge: await getLatestNeoforge(list.gameVersion) } : {}),
    },
    index: { file: "index.toml", "hash-format": "sha512", hash: indexHash },
  });
};

export const getIndexTOML = async (id: string) => {
  const list = await getSpecificList(id);

  if (!list) return null;

  const lim = pLimit(12);

  return stringify({
    "hash-format": "sha512",
    files: await Promise.all(
      list.mods.map((mod) =>
        lim(async () => {
          if (mod.provider === "modrinth") {
            const txt = await getModrinthTOML({
              id: mod.id,
              gameVersions: [list.gameVersion],
              loader: list.modloader,
              name: "",
            });

            if (!txt) return null;

            return {
              file: `mods/${mod.provider}-${mod.id}.pw.toml`,
              hash: await sha512(stringify(txt as unknown as JsonMap)),
              metafile: true,
            };
          } else if (mod.provider === "curseforge") {
            const txt = await getCurseForgeTOML({
              id: mod.id,
              gameVersions: [list.gameVersion],
              loader: list.modloader,
              name: "",
            });

            if (!txt) return null;

            return {
              file: `mods/${mod.provider}-${mod.id}.pw.toml`,
              hash: await sha512(stringify(txt as unknown as JsonMap)),
              metafile: true,
            };
          }

          return null;
        }),
      ),
    ).then((res) => res.filter(Boolean) as AnyJson),
  });
};

export const getModrinthTOML = async (data: ProviderSpecificOptions): Promise<ModPwToml | null> => {
  const res = await getModrinthDownload(data).then(
    (k) => k.filter((dl) => !("error" in dl) && dl.provider === "modrinth") as ModrinthDownload[],
  );
  if (!res || res.length === 0) return null;

  const f = res[0];

  return {
    name: f.displayName,
    filename: f.name,
    download: { url: f.url, "hash-format": "sha512", hash: f.hashes.sha512 },
    update: {
      modrinth: {
        "mod-id": f.id,
        version: f.version,
      },
    },
  };
};

export const getCurseForgeTOML = async (data: ProviderSpecificOptions): Promise<ModPwToml | null> => {
  const res = await getCFDownload(data).then(
    (k) => k.filter((dl) => !("error" in dl) && dl.provider === "curseforge") as CurseForgeDownload[],
  );
  if (!res || res.length === 0) return null;

  const f = res[0];

  return {
    name: f.displayName,
    filename: f.name,
    download: {
      mode: "metadata:curseforge",
      "hash-format": "sha1",
      hash: f.sha1,
    },
    update: { curseforge: { "file-id": f.fileId, "project-id": f.projectId } },
  };
};
