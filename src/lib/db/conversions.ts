import type { Mod, RichMod } from "~/types/moddermore";

export const richModToMod = (orig: RichMod): Mod => {
  return { id: orig.id, provider: orig.provider };
};
