import { loadAsync } from "jszip";
import * as v from "valibot";

import { parseMod } from "./parseModFolder";

import type { Mod } from "~/types/moddermore";
import type { SetStateFn } from "~/types/react";

const ModrinthSideType = v.union([
  v.literal("required"),
  v.literal("optional"),
  v.literal("unsupposted"),
]);

const ModrinthPackIndex = v.object({
  formatVersion: v.literal(1),
  game: v.literal("minecraft"),
  versionId: v.string(),
  name: v.string(),
  summary: v.optional(v.string()),
  files: v.array(
    v.object({
      path: v.string(),
      hashes: v.object({ sha1: v.string(), sha512: v.string() }),
      env: v.optional(
        v.object({ client: ModrinthSideType, server: ModrinthSideType }),
      ),
      downloads: v.array(v.string([v.url()]), [v.minLength(1)]),
      fileSize: v.number(),
    }),
  ),
  dependencies: v.record(v.string()),
});

type ModrinthPackIndex = v.Input<typeof ModrinthPackIndex>;

const modrinthCdnRegex = new RegExp(
  "^https://cdn\\.modrinth\\.com/data/([\\w]+)/versions/([\\w]+)/",
  "m",
);

export const importMrpack = async ({
  file,
  setProgress,
}: {
  file: Uint8Array;
  setProgress: SetStateFn<{
    value: number;
    max: number;
  }>;
}) => {
  const zippy = await loadAsync(file);
  const mrIndex = zippy.file("modrinth.index.json");
  if (!mrIndex) throw new Error("Invalid mrpack");
  const mrIndexString = await mrIndex.async("string");
  const mrIndexData = v.parse(ModrinthPackIndex, JSON.parse(mrIndexString));

  const result: Mod[] = [];

  const fileUrls = mrIndexData.files.map((file) => file.downloads[0]);
  const modFolder = zippy.folder("overrides")?.folder("mods");

  setProgress({
    value: 0,
    max: fileUrls.length + (modFolder ? Object.keys(modFolder.files).length : 0),
  });

  for (const fileUrl of fileUrls) {
    const mrCdnMatch = modrinthCdnRegex.exec(fileUrl);

    if (mrCdnMatch) {
      result.push({
        provider: "modrinth",
        id: mrCdnMatch[1],
        version: mrCdnMatch[2],
      });
    } else {
      try {
        const fileRes = await fetch(fileUrl);
        const fileData = await fileRes
          .blob()
          .then((blob) => blob.arrayBuffer())
          .then((buffer) => new Uint8Array(buffer));

        const parsedMod = await parseMod(fileData);
        if (parsedMod) result.push(parsedMod);
      } catch (error) {
        console.error(error);
      }
    }

    setProgress((prev) => ({ ...prev, value: prev.value + 1 }));
  }

  if (modFolder) {
    for (const [name, overrideMod] of Object.entries(modFolder.files)) {
      if (
        !name.endsWith(".jar")
        || name.includes("__MACOSX/")
        || name.includes(".old/")
        || name.endsWith(".disabled")
        || overrideMod.dir
      ) {
        continue;
      }

      const fileData = await overrideMod.async("uint8array");
      const parsedMod = await parseMod(fileData);
      if (parsedMod) result.push(parsedMod);
      setProgress((prev) => ({ ...prev, value: prev.value + 1 }));
    }
  }

  return result;
};
