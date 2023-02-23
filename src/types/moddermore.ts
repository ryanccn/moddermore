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
  downloads?: number;
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
  mods: z.array(modZod).min(1).max(150),
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
  legacy?: string | null;
}

export interface RichModList {
  id: string;
  created_at: string;
  title: string;
  owner: string | null;
  gameVersion: string;
  modloader: ModLoader;
  mods: RichMod[];
  legacy?: string | null;
}

export interface UserEditableProfileData {
  name: string | null;
  profilePicture: string | null;
}

export interface UserProfileData extends UserEditableProfileData {
  plan: 'pro' | null;
}

export interface UserProfile extends UserProfileData {
  userId: string;
}
