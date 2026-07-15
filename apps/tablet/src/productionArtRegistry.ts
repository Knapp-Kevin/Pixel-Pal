import type { ProductionArtRegistry, ProductionArtStatus } from '@pixel-pals/renderer';

export const productionArtRegistry: ProductionArtRegistry = {
  palAssets: [],
  sceneAssets: []
};

function configuredMinimumStatus(): ProductionArtStatus {
  const requested = import.meta.env.VITE_PIXEL_PALS_ART_STATUS;
  if (requested === 'benchmark' || requested === 'approved' || requested === 'production') {
    return requested;
  }
  return 'production';
}

export const productionArtMinimumStatus = configuredMinimumStatus();
