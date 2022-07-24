import type { ModLoader } from '~/types/moddermore';

export interface ProviderSpecificOptions {
  id: string;
  loader: ModLoader;
  gameVersion: string;
}

export interface Download {
  name: string;
  url: string;
  type: 'direct' | 'dependency';
}

export interface DownloadError {
  error: 'unavailable' | 'notfound';
}

export type ExportReturnData = (Download | DownloadError)[];
