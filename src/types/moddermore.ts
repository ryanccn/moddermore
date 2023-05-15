import { z } from 'zod';

export type ModProvider = 'modrinth' | 'curseforge';
export type ModLoader = 'quilt' | 'fabric' | 'forge';

const Mod = z.object({
  id: z.string(),
  provider: z.union([z.literal('modrinth'), z.literal('curseforge')]),
});

export interface Mod {
  provider: ModProvider;
  id: string;
  version?: string;
}

export interface RichMod {
  provider: ModProvider;
  name: string;
  description?: string;
  downloads?: number;
  iconUrl?: string;
  href: string;
  id: string;
  version?: string;
  gameVersions?: string[];
}

export const ModListCreate = z.object({
  title: z.string().min(1),
  gameVersion: z.string().min(1),
  modloader: z.union([
    z.literal('forge'),
    z.literal('fabric'),
    z.literal('quilt'),
  ]),
  mods: z.array(Mod).min(1).max(500),
});

export type ModListCreate = z.infer<typeof ModListCreate>;

export const ModListUpdate = z.object({
  title: z.string().min(1).optional(),
  gameVersion: z.string().min(1).optional(),
  modloader: z
    .union([z.literal('forge'), z.literal('fabric'), z.literal('quilt')])
    .optional(),
  mods: z.array(Mod).min(1).max(500).optional(),
});

export type ModListUpdate = z.infer<typeof ModListUpdate>;

export interface ModList {
  id: string;
  created_at: string;
  title: string;
  gameVersion: string;
  owner: string | null;
  modloader: ModLoader;
  mods: Mod[];
}

export interface ModListWithOwnerData extends ModList {
  ownersExtraData: { name?: string; profilePicture?: string };
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

export const UserEditableProfileData = z.object({
  name: z.union([z.string(), z.literal(null)]),
  profilePicture: z.union([z.string().url(), z.literal(null)]),
});

export type UserEditableProfileData = z.infer<typeof UserEditableProfileData>;

export interface UserProfileData extends UserEditableProfileData {
  likes?: string[];
}

export interface UserProfile extends UserProfileData {
  userId: string;
}
