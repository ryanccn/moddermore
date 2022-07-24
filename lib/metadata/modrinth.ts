import type { ModrinthProject } from '~/types/modrinth';
import type { RichMod } from '~/types/moddermore';

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
  };
};
