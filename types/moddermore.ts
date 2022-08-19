export type ModProvider = 'modrinth' | 'curseforge';
export type ModLoader = 'quilt' | 'fabric' | 'forge';

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

export interface ModListPartial {
  title: string;
  gameVersion: string;
  modloader: ModLoader;
  mods: Mod[];
}
export interface ModList {
  id: string;
  created_at: string;
  title: string;
  gameVersion: string;
  author: string | null;
  modloader: ModLoader;
  mods: Mod[];
}

export interface RichModList {
  id: string;
  created_at: string;
  title: string;
  author: { username: string; id: string } | null;
  gameVersion: string;
  modloader: ModLoader;
  mods: RichMod[];
}
