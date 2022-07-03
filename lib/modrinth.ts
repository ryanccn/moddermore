import type { RichMod } from './extra.types';

type Side = 'required' | 'optional' | 'unsupported';

interface NetworkResult {
  slug: string;
  title: string;
  description: string;
  categories: string[];
  client_side: Side;
  server_side: Side;
  project_type: 'mod' | 'modpack';
  downloads: number;
  icon_url: string | null;
  id: string;
  team: string;
}

export const getInfo = async (id: string): Promise<RichMod | null> => {
  const res = await fetch(`https://api.modrinth.com/v2/project/${id}`);

  if (res.status === 404) {
    return null;
  }

  const data = (await res.json()) as NetworkResult;

  return {
    id,
    href: `https://modrinth.com/mod/${id}`,
    iconUrl: data.icon_url ?? undefined,
    provider: 'modrinth',
    name: data.title,
    description: data.description,
  };
};
