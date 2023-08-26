import type { Mod, RichMod } from "~/types/moddermore";

export const richModToMod = (orig: RichMod): Mod => {
  return { id: orig.id, provider: orig.provider };
};

export const omitUndefined = <T extends object>(data: T): Partial<T> => {
  const keys = Object.keys(data) as (keyof T)[];
  const ret: Partial<T> = {};
  for (const key of keys) {
    if (data[key] !== undefined) ret[key] = data[key];
  }
  return ret;
};
