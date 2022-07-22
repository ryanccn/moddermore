import type { RichModList } from '../extra.types';
import type { Download, DownloadError } from './types';

import { getCFDownload } from './curseforge';
import { getModrinthDownload } from './modrinth';

export const getDownloadURLs = async (
  list: RichModList,
  setProgress: (arg0: { value: number; max: number }) => void
) => {
  let ret: (Download | DownloadError)[] = [];
  setProgress({ value: 0, max: list.mods.length });

  for (let modIdx = 0; modIdx < list.mods.length; modIdx++) {
    const mod = list.mods[modIdx];

    if (mod.provider === 'curseforge') {
      const dat = await getCFDownload({
        id: mod.id,
        gameVersion: list.gameVersion,
        loader: list.modloader,
      });

      ret = [...ret, ...dat];
    } else if (mod.provider === 'modrinth') {
      const dat = await getModrinthDownload({
        id: mod.id,
        gameVersion: list.gameVersion,
        loader: list.modloader,
      });

      ret = [...ret, ...dat];
    }

    setProgress({ value: modIdx + 1, max: list.mods.length });
  }

  return [...new Set(ret)];
};
