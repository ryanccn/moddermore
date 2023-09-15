import type { RichModList } from "~/types/moddermore";
import type { ExportReturnData } from "./types";

import pLimit from "p-limit";
import { getCFDownload } from "./curseforge";
import { getModrinthDownload } from "./modrinth";

import type { SetStateFn } from "~/types/react";

export const getDownloadURLs = async (
  list: RichModList,
  setProgress: SetStateFn<{ value: number; max: number }>,
) => {
  let ret: ExportReturnData = [];

  const lim = pLimit(8);

  await Promise.all(
    list.mods.map((mod) =>
      lim(async () => {
        if (mod.provider === "curseforge") {
          const dat = await getCFDownload({
            id: mod.id,
            gameVersions: [list.gameVersion],
            loader: list.modloader,
            name: mod.name,
            version: mod.version,
          });

          ret = [...ret, ...dat];
        } else if (mod.provider === "modrinth") {
          const dat = await getModrinthDownload({
            id: mod.id,
            gameVersions: [list.gameVersion],
            loader: list.modloader,
            name: mod.name,
            version: mod.version,
          });

          ret = [...ret, ...dat];
        }

        setProgress((old) => ({ value: old.value + 1, max: old.max }));
      }),
    ),
  );

  return ret;
};
