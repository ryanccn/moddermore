import type { CurseForgeProject, CurseForgeVersion } from "~/types/curseforge";
import type { RichMod } from "~/types/moddermore";

import { remoteFetch } from "../remoteFetch";

// type Side = 'required' | 'optional' | 'unsupported';

export const getInfo = async (id: string): Promise<RichMod | null> => {
  const API_KEY = process.env.NEXT_PUBLIC_CURSEFORGE_API_KEY;
  if (!API_KEY) throw new Error("No NEXT_PUBLIC_CURSEFORGE_API_KEY defined!");

  const res = await remoteFetch(`https://api.curseforge.com/v1/mods/${id}`, {
    headers: { "x-api-key": API_KEY },
  });

  if (!res.ok) return null;

  const data = (await res.json().then((json) => json.data)) as CurseForgeProject;

  return {
    id,
    href: `https://curseforge.com/minecraft/mc-mods/${data.slug}`,
    iconUrl: data.logo.thumbnailUrl ?? undefined,
    provider: "curseforge",
    name: data.name,
    description: data.summary,
    downloads: data.downloadCount,
  };
};

export const getInfos = async (projects: { id: string; version?: string }[]): Promise<RichMod[]> => {
  const API_KEY = process.env.NEXT_PUBLIC_CURSEFORGE_API_KEY;
  if (!API_KEY) throw new Error("No NEXT_PUBLIC_CURSEFORGE_API_KEY defined!");

  if (projects.length === 0) return [];

  const res = await remoteFetch(`https://api.curseforge.com/v1/mods`, {
    method: "POST",
    body: JSON.stringify({ modIds: projects.map((p) => p.id) }),
    headers: { "x-api-key": API_KEY, "Content-Type": "application/json" },
  });

  if (!res.ok) {
    return [];
  }

  const data = (await res.json().then((json) => json.data)) as CurseForgeProject[];

  return data.map((mod) => {
    const version = projects.find((p) => p.id === `${mod.id}`)!.version;

    return {
      id: `${mod.id}`,
      href: `https://curseforge.com/minecraft/mc-mods/${mod.slug}`,
      iconUrl: mod.logo.thumbnailUrl ?? undefined,
      provider: "curseforge",
      name: mod.name,
      description: mod.summary,
      downloads: mod.downloadCount,
      ...(version ? { version } : {}),
    };
  });
};

export const fetchVersions = async ({
  projectId,
  loader,
  gameVersion,
}: {
  projectId: string;
  loader: string;
  gameVersion: string;
}) => {
  const API_KEY = process.env.NEXT_PUBLIC_CURSEFORGE_API_KEY;
  if (!API_KEY) throw new Error("No NEXT_PUBLIC_CURSEFORGE_API_KEY defined!");

  const modLoaderType =
    loader === "forge" || loader === "neoforge" ? 1 : loader === "fabric" ? 4 : loader === "quilt" ? 5 : -1;

  const res = await remoteFetch(
    `https://api.curseforge.com/v1/mods/${projectId}/files?gameVersion=${encodeURIComponent(
      gameVersion,
    )}&modLoaderType=${modLoaderType}`,
    {
      headers: { "x-api-key": API_KEY },
    },
  );

  if (res.status === 404) return null;

  const data = (await res.json().then((json) => json.data)) as CurseForgeVersion[];

  return data.map((v) => ({ id: `${v.id}`, name: v.displayName }));
};
