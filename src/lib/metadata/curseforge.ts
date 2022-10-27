import type { CurseForgeProject } from '~/types/curseforge';
import type { RichMod } from '~/types/moddermore';

// type Side = 'required' | 'optional' | 'unsupported';

export const getInfo = async (id: string): Promise<RichMod | null> => {
  const API_KEY = process.env.NEXT_PUBLIC_CURSEFORGE_API_KEY;
  if (!API_KEY) throw new Error('No NEXT_PUBLIC_CURSEFORGE_API_KEY defined!');

  const res = await fetch(`https://api.curseforge.com/v1/mods/${id}`, {
    headers: { 'x-api-key': API_KEY },
  });

  if (!res.ok) {
    return null;
  }

  const data = (await res
    .json()
    .then((json) => json.data)) as CurseForgeProject;

  return {
    id,
    href: `https://curseforge.com/minecraft/mc-mods/${data.slug}`,
    iconUrl: data.logo.thumbnailUrl ?? undefined,
    provider: 'curseforge',
    name: data.name,
    description: data.summary,
    downloads: data.downloadCount,
  };
};
