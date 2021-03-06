import type { ModLoader, ModProvider } from '~/types/moddermore';

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
