import { z } from 'zod';

export type ModProvider = 'modrinth' | 'curseforge';
export type ModLoader = 'quilt' | 'fabric' | 'forge';

const modZod = z.object({
  id: z.string(),
  provider: z.union([z.literal('modrinth'), z.literal('curseforge')]),
});

export interface Mod {
  provider: ModProvider;
  id: string;
}

export interface RichMod {
  provider: ModProvider;
  name: string;
  description?: string;
  iconUrl?: string;
  href: string;
  id: string;
}

export const modListPartialZod = z.object({
  title: z.string().min(1),
  gameVersion: z.string().min(1),
  modloader: z.union([
    z.literal('forge'),
    z.literal('fabric'),
    z.literal('quilt'),
  ]),
  mods: z.array(modZod).min(1),
});

export type ModListPartial = z.infer<typeof modListPartialZod>;

export interface ModList {
  id: string;
  created_at: string;
  title: string;
  gameVersion: string;
  owner: string | null;
  modloader: ModLoader;
  mods: Mod[];
}

export interface RichModList {
  id: string;
  created_at: string;
  title: string;
  owner: string | null;
  gameVersion: string;
  modloader: ModLoader;
  mods: RichMod[];
}
