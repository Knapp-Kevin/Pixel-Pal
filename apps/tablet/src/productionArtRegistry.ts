import type { ProductionArtStatus } from '@pixel-pals/renderer';
import {
  generatedProductionArtRegistry,
  generatedProductionArtRelease
} from './generatedProductionArtRegistry';

export const productionArtRegistry = generatedProductionArtRegistry;
export const productionArtRelease = generatedProductionArtRelease;

function configuredMinimumStatus(): ProductionArtStatus {
  const requested = import.meta.env.VITE_PIXEL_PALS_ART_STATUS;
  if (requested === 'benchmark' || requested === 'approved' || requested === 'production') {
    return requested;
  }
  return 'production';
}

export const productionArtMinimumStatus = configuredMinimumStatus();
