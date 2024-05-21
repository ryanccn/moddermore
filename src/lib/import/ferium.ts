import type { Mod, ModProvider } from "~/types/moddermore";

export const parseFerium = (str: string) => {
  const lines = str.split("\n").filter(Boolean);
  const matrix = lines.map((l) => l.split(" ").filter(Boolean));

  const ret: Mod[] = [];

  for (const mod of matrix) {
    const rawProvider = mod.at(-2);

    const provider: ModProvider | null =
      rawProvider === "Modrinth" ? "modrinth" : rawProvider === "CurseForge" ? "curseforge" : null;

    if (provider) {
      ret.push({ id: mod.at(-1)!, provider });
    }
  }

  return ret;
};
