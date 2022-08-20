import type { RichModList } from '~/types/moddermore';
import type { ExportReturnData } from './types';

import pLimit from 'p-limit';
import { getCFDownload } from './curseforge';
import { getModrinthDownload } from './modrinth';
import type { SetStateFn } from '~/types/react';

export const getDownloadURLs = async (
  list: RichModList,
  setProgress: SetStateFn<{ value: number; max: number }>
) => {
  let ret: ExportReturnData = [];

  const lim = pLimit(6);

  await Promise.all(
    list.mods.map((mod) =>
      lim(async () => {
        if (mod.provider === 'curseforge') {
          let dat = await getCFDownload({
            id: mod.id,
            gameVersion: list.gameVersion,
            loader: list.modloader,
            name: mod.name,
          });

          if (list.modloader === 'quilt' && dat.length === 0) {
            dat = await getCFDownload({
              id: mod.id,
              gameVersion: list.gameVersion,
              loader: 'fabric',
              name: mod.name,
            });
          }

          ret = [...ret, ...dat];
        } else if (mod.provider === 'modrinth') {
          let dat = await getModrinthDownload({
            id: mod.id,
            gameVersion: list.gameVersion,
            loader: list.modloader,
            name: mod.name,
          });

          if (list.modloader === 'quilt' && dat.length === 0) {
            dat = await getModrinthDownload({
              id: mod.id,
              gameVersion: list.gameVersion,
              loader: 'fabric',
              name: mod.name,
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
