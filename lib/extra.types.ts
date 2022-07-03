export type ModProvider = 'modrinth' | 'curseforge' | 'github';

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

export interface ModList {
  id: string;
  created_at: string;
  title: string;
  mods: Mod[];
}

export interface ModListPartial {
  title: string;
  mods: Mod[];
}

export interface RichModList {
  id: string;
  created_at: string;
  title: string;
  mods: RichMod[];
}
