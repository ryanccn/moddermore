import * as v from "valibot";
import minecraftVersions from "~/lib/minecraftVersions.json";

export const ModProvider = v.union([v.literal("modrinth"), v.literal("curseforge")]);
export type ModProvider = v.InferOutput<typeof ModProvider>;

export const ModLoader = v.union([
  v.literal("quilt"),
  v.literal("fabric"),
  v.literal("neoforge"),
  v.literal("forge"),
]);
export type ModLoader = v.InferOutput<typeof ModLoader>;

export const ListVisibility = v.union([v.literal("private"), v.literal("unlisted"), v.literal("public")]);
export type ListVisibility = v.InferOutput<typeof ListVisibility>;

export const Mod = v.strictObject({
  id: v.string(),
  provider: ModProvider,
  version: v.optional(v.nullable(v.string())),
});

export type Mod = v.InferOutput<typeof Mod>;

export interface RichMod {
  provider: ModProvider;
  name: string;
  description?: string;
  downloads?: number;
  iconUrl?: string;
  href: string;
  id: string;
  version?: string;
  cachedVersionName?: string;
  gameVersions?: string[];
}

export const ModListCreate = v.strictObject({
  title: v.pipe(v.string(), v.minLength(1)),
  description: v.optional(v.pipe(v.string(), v.minLength(1))),
  gameVersion: v.picklist([...minecraftVersions.releases, ...minecraftVersions.snapshots]),
  modloader: ModLoader,
  mods: v.pipe(v.array(Mod), v.minLength(1), v.maxLength(500)),
});

export type ModListCreate = v.InferOutput<typeof ModListCreate>;

export const ModListUpdate = v.strictObject({
  title: v.optional(v.pipe(v.string(), v.minLength(1))),
  description: v.optional(v.nullable(v.pipe(v.string(), v.minLength(1)))),
  gameVersion: v.optional(v.picklist([...minecraftVersions.releases, ...minecraftVersions.snapshots])),
  modloader: ModLoader,
  visibility: ListVisibility,
  mods: v.optional(v.pipe(v.array(Mod), v.minLength(1), v.maxLength(500))),
});

export type ModListUpdate = v.InferOutput<typeof ModListUpdate>;

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

export const UserEditableProfileData = v.strictObject({
  name: v.union([v.string(), v.null_()]),
  profilePicture: v.union([v.pipe(v.string(), v.url()), v.null_()]),
});

export type UserEditableProfileData = v.InferOutput<typeof UserEditableProfileData>;

export interface UserProfileData extends UserEditableProfileData {
  likes?: string[];
  banned?: boolean;
  isAdmin?: boolean;
}

export interface UserProfile extends UserProfileData {
  userId: string;
}
