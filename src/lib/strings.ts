import type { ModLoader, ModProvider } from '~/types/moddermore';

export const numberFormat = (value: number): string => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;

  return `${value}`;
};

export const providerFormat = (prov: ModProvider) => {
  if (prov === 'curseforge') return 'CurseForge';
  else if (prov === 'modrinth') return 'Modrinth';
  else if (prov === 'github') return 'GitHub';

  return 'Unknown';
};

export const loaderFormat = (loader: ModLoader) => {
  if (loader === 'fabric') return 'Fabric';
  else if (loader === 'forge') return 'Forge';
  else if (loader === 'quilt') return 'Quilt';

  return 'Unknown';
};
