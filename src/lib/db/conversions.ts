// import { getInfo as getModrinthInfo } from '../metadata/modrinth';
import { getInfo as getCurseForgeInfo } from '../metadata/curseforge';

import type { RichMod, Mod } from '~/types/moddermore';

export const richModToMod = (orig: RichMod): Mod => {
  return { id: orig.id, provider: orig.provider };
};

export const modToRichMod = async (orig: Mod): Promise<RichMod | null> => {
  // if (orig.provider === 'modrinth') {
  //   const info = await getModrinthInfo(orig.id);
  //   if (info) return info;
  // } else if (orig.provider === 'curseforge') {

  if (orig.provider === 'curseforge') {
    const info = await getCurseForgeInfo(orig.id);
    if (info) return info;
  }

  return null;
};
