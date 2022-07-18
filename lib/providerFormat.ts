import type { ModProvider } from "./extra.types";

export const providerFormat = (prov: ModProvider) => {
  if (prov === "curseforge") return "CurseForge";
  else if (prov === "modrinth") return "Modrinth";
  else if (prov === "github") return "GitHub";

  return "Unknown";
};
