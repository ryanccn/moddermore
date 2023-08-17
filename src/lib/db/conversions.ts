import type { RichMod, Mod } from '~/types/moddermore';

export const richModToMod = (orig: RichMod): Mod => {
  return { id: orig.id, provider: orig.provider };
};
