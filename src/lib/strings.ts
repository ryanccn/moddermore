import type { ModLoader, ModProvider } from '~/types/moddermore';

export const numberFormat = (value: number): string => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;

  return `${value}`;
};

export const providerFormat = (prov: ModProvider) => {
  switch (prov) {
    case 'curseforge': {
      return 'CurseForge';
    }
    case 'modrinth': {
      return 'Modrinth';
    }
  }
};

export const loaderFormat = (loader: ModLoader) => {
  switch (loader) {
    case 'fabric': {
      return 'Fabric';
    }
    case 'forge': {
      return 'Forge';
    }
    case 'quilt': {
      return 'Quilt';
    }
    default: {
      return 'Unknown';
    }
  }
};
