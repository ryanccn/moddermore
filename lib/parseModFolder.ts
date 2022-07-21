import { loadAsync } from 'jszip';
import { search } from './search';

import type { ModLoader, RichMod } from './extra.types';

interface InputData {
  f: ArrayBuffer;
  gameVersion: string;
  loader: ModLoader;
}

const matchName = (a: string, b: string) => {
  return a.includes(b) || b.includes(a);
};

export const parseMod = async ({ f, gameVersion, loader }: InputData) => {
  const zipFile = await loadAsync(f);
  const infoFile =
    zipFile.file('quilt.mod.json') ?? zipFile.file('fabric.mod.json');

  if (!infoFile) {
    throw new Error('F');
  }

  const info = await infoFile.async('text').then((txt) => JSON.parse(txt));
  let name = ((info.name ?? info.id) as string).toLowerCase();

  if (name.startsWith('cloth config')) {
    name = 'cloth config api';
  }

  const searchResult = await search({
    platform: 'modrinth',
    query: name,
    gameVersion,
    loader,
  }).then((res) => res.filter((a) => matchName(a.name.toLowerCase(), name))[0]);

  if (!searchResult) {
    const cursedResult = await search({
      platform: 'curseforge',
      query: name,
      gameVersion,
      loader,
    }).then(
      (res) => res.filter((a) => matchName(a.name.toLowerCase(), name))[0]
    );

    if (cursedResult) {
      // console.log(cursedResult);
      return cursedResult;
    }
  }

  if (!searchResult) {
    console.warn("Couldn't find for", name);
    return null;
  }

  return searchResult;
};

export const parseModFolder = async ({ f, gameVersion, loader }: InputData) => {
  const zipFile = await loadAsync(f);
  const mods = Object.keys(zipFile.files).filter(
    (name) =>
      name.endsWith('.jar') &&
      !name.includes('__MACOSX') &&
      !name.includes('.old')
  );

  console.log({ mods });

  let ret: (RichMod | null)[] = [];

  for (const mod of mods) {
    try {
      ret = [
        ...ret,
        await parseMod({
          f: await zipFile.files[mod].async('arraybuffer'),
          gameVersion,
          loader,
        }),
      ];
    } catch (e) {
      console.error(e);
    }
  }

  return ret;
};
