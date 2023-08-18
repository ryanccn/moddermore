import { loadAsync } from 'jszip';
import { z } from 'zod';

import { parseMod } from './parseModFolder';

import type { Mod } from '~/types/moddermore';
import type { SetStateFn } from '~/types/react';

const ModrinthSideType = z.union([
  z.literal('required'),
  z.literal('optional'),
  z.literal('unsupposted'),
]);

const ModrinthPackIndex = z.object({
  formatVersion: z.literal(1),
  game: z.literal('minecraft'),
  versionId: z.string(),
  name: z.string(),
  summary: z.string().optional(),
  files: z
    .object({
      path: z.string(),
      hashes: z.object({ sha1: z.string(), sha512: z.string() }),
      env: z
        .object({ client: ModrinthSideType, server: ModrinthSideType })
        .optional(),
      downloads: z.string().url().array().min(1),
      fileSize: z.number(),
    })
    .array(),
  dependencies: z.record(z.string()),
});

type ModrinthPackIndex = z.infer<typeof ModrinthPackIndex>;

const modrinthCdnRegex = new RegExp(
  '^https://cdn\\.modrinth\\.com/data/([\\w]+)/versions/[\\w]+/',
  'm',
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
  const mrIndex = zippy.file('modrinth.index.json');
  if (!mrIndex) throw new Error('Invalid mrpack');
  const mrIndexString = await mrIndex.async('string');
  const mrIndexData = ModrinthPackIndex.parse(JSON.parse(mrIndexString));

  const result: Mod[] = [];

  const fileUrls = mrIndexData.files.map((file) => file.downloads[0]);
  const modFolder = zippy.folder('overrides')?.folder('mods');

  setProgress({
    value: 0,
    max:
      fileUrls.length + (modFolder ? Object.keys(modFolder.files).length : 0),
  });

  for (const fileUrl of fileUrls) {
    const mrCdnMatch = modrinthCdnRegex.exec(fileUrl);

    if (mrCdnMatch) {
      result.push({ provider: 'modrinth', id: mrCdnMatch[1] });
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
        !name.endsWith('.jar') ||
        name.includes('__MACOSX/') ||
        name.includes('.old/') ||
        name.endsWith('.disabled') ||
        overrideMod.dir
      ) {
        continue;
      }

      const fileData = await overrideMod.async('uint8array');
      const parsedMod = await parseMod(fileData);
      if (parsedMod) result.push(parsedMod);
      setProgress((prev) => ({ ...prev, value: prev.value + 1 }));
    }
  }

  return result;
};
