import * as v from "valibot";

export const ModProvider = v.union([v.literal("modrinth"), v.literal("curseforge")]);
export type ModProvider = v.Input<typeof ModProvider>;

export const ModLoader = v.union([v.literal("quilt"), v.literal("fabric"), v.literal("forge")]);
export type ModLoader = v.Input<typeof ModLoader>;

export const ListVisibility = v.union([v.literal("private"), v.literal("unlisted"), v.literal("public")]);
export type ListVisibility = v.Input<typeof ListVisibility>;

export const Mod = v.object({
  id: v.string(),
  provider: ModProvider,
  version: v.optional(v.nullable(v.string())),
});

export type Mod = v.Input<typeof Mod>;

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

export const ModListCreate = v.object({
  title: v.string([v.minLength(1)]),
  description: v.optional(v.string([v.minLength(1)])),
  gameVersion: v.string([v.minLength(1)]),
  modloader: ModLoader,
  mods: v.array(Mod, [v.minLength(1), v.maxLength(500)]),
});

export type ModListCreate = v.Input<typeof ModListCreate>;

export const ModListUpdate = v.object({
  title: v.optional(v.string([v.minLength(1)])),
  description: v.optional(v.nullable(v.string([v.minLength(1)]))),
  gameVersion: v.optional(v.string([v.minLength(1)])),
  modloader: ModLoader,
  visibility: ListVisibility,
  mods: v.optional(v.array(Mod, [v.minLength(1), v.maxLength(500)])),
});

export type ModListUpdate = v.Input<typeof ModListUpdate>;

export interface ModList {
  id: string;
  created_at: string;
  title: string;
  gameVersion: string;
  description: string | null;
  owner: string | null;
  visibility: ListVisibility;
  modloader: ModLoader;
  mods: Mod[];
}

export interface ModListWithExtraData extends ModList {
  likes: number;
  ownerProfile: {
    name: string | null;
    profilePicture: string | null;
    banned: boolean | null;
  };
}

export interface RichModList {
  id: string;
  created_at: string;
  title: string;
  description: string | null;
  owner: string | null;
  gameVersion: string;
  modloader: ModLoader;
  mods: RichMod[];
}

export const UserEditableProfileData = v.object({
  name: v.union([v.string(), v.nullType()]),
  profilePicture: v.union([v.string([v.url()]), v.nullType()]),
});

export type UserEditableProfileData = v.Input<typeof UserEditableProfileData>;

export interface UserProfileData extends UserEditableProfileData {
  likes?: string[];
  banned?: boolean;
  isAdmin?: boolean;
}

export interface UserProfile extends UserProfileData {
  userId: string;
}
