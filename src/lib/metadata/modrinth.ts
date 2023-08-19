import type { ModrinthProject } from '~/types/modrinth';
import type { RichMod } from '~/types/moddermore';

/**
 * @deprecated
 * @param id The ID of the Modrinth mod
 * @returns The mod metadata
 */
export const getInfo = async (id: string): Promise<RichMod | null> => {
  const res = await fetch(`https://api.modrinth.com/v2/project/${id}`, {
    headers: { 'User-Agent': 'Moddermore/noversion' },
  });

  if (!res.ok) {
    return null;
  }

  const data = (await res.json()) as ModrinthProject;

  return {
    id,
    href: `https://modrinth.com/mod/${data.slug}`,
    iconUrl: data.icon_url ?? undefined,
    provider: 'modrinth',
    name: data.title,
    description: data.description,
    downloads: data.downloads,
    ...(data.game_versions ? { gameVersions: data.game_versions } : {}),
  };
};

export const getInfos = async (ids: string[]): Promise<RichMod[] | null> => {
  if (ids.length === 0) return [];

  const res = await fetch(
    `https://api.modrinth.com/v2/projects?ids=${encodeURIComponent(
      JSON.stringify(ids),
    )}`,
    {
      headers: { 'User-Agent': 'Moddermore/noversion' },
    },
  );

  if (!res.ok) {
    return null;
  }

  const data = (await res.json()) as ModrinthProject[];

  return data.map((mod) => ({
    id: mod.id,
    href: `https://modrinth.com/mod/${mod.slug}`,
    iconUrl: mod.icon_url ?? undefined,
    provider: 'modrinth',
    name: mod.title,
    description: mod.description,
    downloads: mod.downloads,
    ...(mod.game_versions ? { gameVersions: mod.game_versions } : {}),
  }));
};
