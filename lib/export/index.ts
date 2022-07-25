import type { RichModList } from '~/types/moddermore';
import type { Download, DownloadError } from './types';
import type { Dispatch, SetStateAction } from 'react';

import pLimit from 'p-limit';
import { getCFDownload } from './curseforge';
import { getModrinthDownload } from './modrinth';

export const getDownloadURLs = async (
  list: RichModList,
  setProgress: Dispatch<SetStateAction<{ value: number; max: number }>>
) => {
  let ret: (Download | DownloadError)[] = [];
  setProgress({ value: 0, max: list.mods.length });

  const lim = pLimit(4);

  await Promise.all(
    list.mods.map((mod) =>
      lim(async () => {
        if (mod.provider === 'curseforge') {
          let dat = await getCFDownload({
            id: mod.id,
            gameVersion: list.gameVersion,
            loader: list.modloader,
          });

          if (list.modloader === 'quilt' && dat.length === 0) {
            dat = await getCFDownload({
              id: mod.id,
              gameVersion: list.gameVersion,
              loader: 'fabric',
            });
          }

          ret = [...ret, ...dat];
        } else if (mod.provider === 'modrinth') {
          let dat = await getModrinthDownload({
            id: mod.id,
            gameVersion: list.gameVersion,
            loader: list.modloader,
          });

          if (list.modloader === 'quilt' && dat.length === 0) {
            dat = await getModrinthDownload({
              id: mod.id,
              gameVersion: list.gameVersion,
              loader: 'fabric',
            });
          }

          ret = [...ret, ...dat];
        }

        setProgress((old) => ({ value: old.value + 1, max: old.max }));
      })
    )
  );

  return [...new Set(ret)];
};
