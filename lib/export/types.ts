import type { ModLoader, ModProvider } from '~/types/moddermore';

export interface ProviderSpecificOptions {
  id: string;
  loader: ModLoader;
  gameVersion: string;
}

export interface ModrinthDownload {
  name: string;
  url: string;
  type: 'direct' | 'dependency';
  provider: 'modrinth';
  fileSize: number;
  hashes: {
    sha1: string;
    sha512: string;
  };
}

export interface CurseForgeDownload {
  name: string;
  url: string;
  type: 'direct' | 'dependency';
  provider: 'curseforge';
  fileSize: number;
}

export type Download = ModrinthDownload | CurseForgeDownload;

export interface DownloadError {
  error: 'unavailable' | 'notfound';
}

export type ExportReturnData = (Download | DownloadError)[];
