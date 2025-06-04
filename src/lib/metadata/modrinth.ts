import minecraftVersions from "~/lib/minecraftVersions.json";

import type { RichMod } from "~/types/moddermore";
import type { ModrinthProject, ModrinthVersion } from "~/types/modrinth";

import { remoteFetch } from "../utils/remoteFetch";

/**
 * @param id The ID of the Modrinth mod
 * @returns The mod metadata
 * @deprecated
 */
export const getInfo = async (id: string): Promise<RichMod | null> => {
  const res = await remoteFetch(`https://api.modrinth.com/v2/project/${id}`);

  if (!res.ok) return null;

  const data = (await res.json()) as ModrinthProject;

  return {
    id,
    href: `https://modrinth.com/mod/${data.slug}`,
    iconUrl: data.icon_url ?? undefined,
    provider: "modrinth",
    name: data.title,
    description: data.description,
    downloads: data.downloads,
    ...(data.game_versions ? { gameVersions: data.game_versions } : {}),
  };
};

export const getInfos = async (projects: { id: string; version?: string }[]): Promise<RichMod[] | null> => {
  if (projects.length === 0) return [];

  const res = await remoteFetch(
    `https://api.modrinth.com/v2/projects?ids=${encodeURIComponent(
      JSON.stringify(projects.map((p) => p.id)),
    )}`,
  );

  if (!res.ok) return null;

  const data = (await res.json()) as ModrinthProject[];

  return data.map((mod) => {
    const version = projects.find((p) => p.id === mod.id)!.version;

    return {
      id: mod.id,
      href: `https://modrinth.com/mod/${mod.slug}`,
      iconUrl: mod.icon_url ?? undefined,
      provider: "modrinth",
      name: mod.title,
      description: mod.description,
      downloads: mod.downloads,
      ...(mod.game_versions ? { gameVersions: mod.game_versions } : {}),
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
  const patchedLoaders = [loader];
  if (loader === "quilt") patchedLoaders.push("fabric");
  if (loader === "neoforge") patchedLoaders.push("forge");

  const compatGameVersions = minecraftVersions.snapshots.includes(gameVersion)
    ? []
    : minecraftVersions.releases.filter((a) => a.startsWith(gameVersion.split(".").slice(0, 2).join(".")));

  const res = await remoteFetch(
    `https://api.modrinth.com/v2/project/${encodeURIComponent(
      projectId,
    )}/version?loaders=${encodeURIComponent(
      JSON.stringify(patchedLoaders),
    )}&game_versions=${encodeURIComponent(JSON.stringify(compatGameVersions))}`,
  );

  if (!res.ok) return null;

  const data = (await res.json()) as ModrinthVersion[];
  return data.map((v) => ({ id: v.id, name: v.version_number }));
};
