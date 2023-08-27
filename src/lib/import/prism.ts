import { parse } from "@iarna/toml";
import type JSZip from "jszip";
import pLimit from "p-limit";
import toast from "react-hot-toast";
import { parseModFolder } from "./parseModFolder";

import type { Mod } from "~/types/moddermore";
import type { ModPwToml } from "~/types/packwiz";
import type { SetStateFn } from "~/types/react";

interface InputData {
  f: JSZip;
  useMetadata: boolean;
  setProgress: SetStateFn<{
    value: number;
    max: number;
  }>;
}

const parsePackwizTOML = (toml: string): Mod | null => {
  const { update: updateInfo } = parse(toml) as unknown as ModPwToml;

  if (!updateInfo) {
    console.error("no update info found");
    return null;
  }

  if (updateInfo.modrinth) {
    return {
      id: updateInfo.modrinth["mod-id"],
      provider: "modrinth",
      // version: updateInfo.modrinth.version,
    };
  } else if (updateInfo.curseforge) {
    return {
      id: `${updateInfo.curseforge["project-id"]}`,
      provider: "curseforge",
      // version: `${updateInfo.curseforge["file-id"]}`,
    };
  }

  console.error("no update info found in `update`");

  return null;
};

export const parsePrismInstance = async ({
  f,
  useMetadata,
  setProgress,
}: InputData) => {
  const mcFolder = f.folder(".minecraft");

  if (!mcFolder) {
    toast.error("No .minecraft folder exists!");
    return null;
  }

  const modFolder = mcFolder.folder("mods");

  if (!modFolder) {
    toast.error("No mods folder exists!");
    return null;
  }

  const pwIndexDir = modFolder.folder(".index");

  if (pwIndexDir && useMetadata) {
    console.log(".index folder detected, using packwiz format");

    const mods = Object.keys(pwIndexDir.files).filter((fn) => fn.endsWith("toml"));

    const ret: (Mod | null)[] = [];
    setProgress({ value: 0, max: mods.length });

    const resolveLimit = pLimit(8);

    await Promise.all(
      mods.map((mod) =>
        resolveLimit(async () => {
          try {
            const modFile = await pwIndexDir.files[mod].async("text");
            ret.push(parsePackwizTOML(modFile));
          } catch (error) {
            console.error(error);
          }

          setProgress((prev) => ({ ...prev, value: prev.value + 1 }));
        })
      ),
    );

    return ret;
  }

  console.warn("falling back to mod folder");
  return await parseModFolder({ f: modFolder, setProgress });
};
