import { createContext, useContext, type CSSProperties, type ReactNode } from 'react';
import {
  PalPortrait,
  type PalExpression,
  type PalPortraitProps,
  type PalPose,
  type PalSpecies
} from './PalPortrait';

export type ProductionArtStatus = 'benchmark' | 'approved' | 'production';
export type ProductionArtFallbackPolicy = 'alpha' | 'block';

export type PalArtworkAsset = {
  id: string;
  status: ProductionArtStatus;
  src: string;
  width: number;
  height: number;
  species: PalSpecies;
  artIdentity?: string;
  paletteId?: string;
  markingId?: string;
  accessoryId?: string | null;
  expression?: PalExpression;
  pose?: PalPose;
  alt?: string;
  objectPosition?: string;
};

export type SceneArtworkAsset = {
  id: string;
  status: ProductionArtStatus;
  src: string;
  width: number;
  height: number;
  portraitSrc?: string;
  portraitWidth?: number;
  portraitHeight?: number;
  sceneId: string;
  variant?: string;
  alt: string;
  objectPosition?: string;
  portraitObjectPosition?: string;
};

export type ProductionArtRegistry = {
  palAssets: readonly PalArtworkAsset[];
  sceneAssets: readonly SceneArtworkAsset[];
};

export const EMPTY_PRODUCTION_ART_REGISTRY: ProductionArtRegistry = {
  palAssets: [],
  sceneAssets: []
};

const STATUS_RANK: Record<ProductionArtStatus, number> = {
  benchmark: 1,
  approved: 2,
  production: 3
};

function statusAllowed(status: ProductionArtStatus, minimumStatus: ProductionArtStatus): boolean {
  return STATUS_RANK[status] >= STATUS_RANK[minimumStatus];
}

export type PalArtworkRequest = PalPortraitProps & {
  artIdentity?: string;
};

function matchesPalAsset(asset: PalArtworkAsset, request: PalArtworkRequest): boolean {
  if (asset.species !== request.species) return false;
  if (asset.artIdentity !== undefined && asset.artIdentity !== request.artIdentity) return false;
  if (asset.paletteId !== undefined && asset.paletteId !== request.paletteId) return false;
  if (asset.markingId !== undefined && asset.markingId !== request.markingId) return false;
  if (asset.accessoryId !== undefined && (asset.accessoryId ?? undefined) !== request.accessoryId) return false;
  if (asset.expression !== undefined && asset.expression !== (request.expression ?? 'content')) return false;
  if (asset.pose !== undefined && asset.pose !== (request.pose ?? 'standing')) return false;
  return true;
}

function palSpecificity(asset: PalArtworkAsset, request: PalArtworkRequest): number {
  let score = STATUS_RANK[asset.status];
  if (asset.artIdentity !== undefined && asset.artIdentity === request.artIdentity) score += 64;
  if (asset.paletteId !== undefined) score += 16;
  if (asset.markingId !== undefined) score += 8;
  if (asset.accessoryId !== undefined) score += 4;
  if (asset.expression !== undefined) score += 2;
  if (asset.pose !== undefined) score += 1;
  return score;
}

export function resolvePalArtwork(
  registry: ProductionArtRegistry,
  request: PalArtworkRequest,
  minimumStatus: ProductionArtStatus = 'production'
): PalArtworkAsset | null {
  const matches = registry.palAssets
    .filter((asset) => statusAllowed(asset.status, minimumStatus) && matchesPalAsset(asset, request))
    .sort((left, right) => palSpecificity(right, request) - palSpecificity(left, request));
  return matches[0] ?? null;
}

export function resolveSceneArtwork(
  registry: ProductionArtRegistry,
  sceneId: string,
  variant: string | undefined,
  minimumStatus: ProductionArtStatus = 'production'
): SceneArtworkAsset | null {
  const candidates = registry.sceneAssets
    .filter((asset) => statusAllowed(asset.status, minimumStatus) && asset.sceneId === sceneId)
    .filter((asset) => asset.variant === undefined || asset.variant === variant)
    .sort((left, right) => {
      const leftScore = STATUS_RANK[left.status] + (left.variant === variant ? 8 : 0);
      const rightScore = STATUS_RANK[right.status] + (right.variant === variant ? 8 : 0);
      return rightScore - leftScore;
    });
  return candidates[0] ?? null;
}

type ProductionArtContextValue = {
  registry: ProductionArtRegistry;
  minimumStatus: ProductionArtStatus;
  fallbackPolicy: ProductionArtFallbackPolicy;
};

const ProductionArtContext = createContext<ProductionArtContextValue>({
  registry: EMPTY_PRODUCTION_ART_REGISTRY,
  minimumStatus: 'production',
  fallbackPolicy: 'alpha'
});

export type ProductionArtProviderProps = {
  registry: ProductionArtRegistry;
  minimumStatus?: ProductionArtStatus;
  fallbackPolicy?: ProductionArtFallbackPolicy;
  children: ReactNode;
};

export function ProductionArtProvider({
  registry,
  minimumStatus = 'production',
  fallbackPolicy = 'alpha',
  children
}: ProductionArtProviderProps) {
  return (
    <ProductionArtContext.Provider value={{ registry, minimumStatus, fallbackPolicy }}>
      {children}
    </ProductionArtContext.Provider>
  );
}

function BlockedArt({
  kind,
  label,
  className
}: {
  kind: 'pal' | 'scene';
  label: string;
  className?: string;
}) {
  return (
    <div
      className={[className, 'production-art-block', `production-art-block-${kind}`].filter(Boolean).join(' ')}
      role="img"
      aria-label={`${label}. Production artwork is not yet available.`}
      data-production-art-blocked={kind}
    >
      <span className="production-art-block-label">Production art pending</span>
      <strong>{label}</strong>
    </div>
  );
}

export function PalArtwork(props: PalArtworkRequest) {
  const { registry, minimumStatus, fallbackPolicy } = useContext(ProductionArtContext);
  const asset = resolvePalArtwork(registry, props, minimumStatus);

  if (!asset) {
    if (fallbackPolicy === 'alpha') return <PalPortrait {...props} />;
    return <BlockedArt kind="pal" label={`${props.name}, ${props.species} Pal`} className={props.className} />;
  }

  return (
    <img
      className={props.className}
      src={asset.src}
      width={asset.width}
      height={asset.height}
      alt={asset.alt ?? `${props.name}, a ${props.species} Pal`}
      draggable={false}
      decoding="async"
      data-art-asset-id={asset.id}
      data-art-status={asset.status}
      style={{ objectFit: 'contain', objectPosition: asset.objectPosition ?? '50% 50%' }}
    />
  );
}

export type SceneArtworkProps = {
  sceneId: string;
  variant?: string;
  className?: string;
  fallback: ReactNode;
};

type ResponsiveSceneStyle = CSSProperties & {
  '--scene-object-position': string;
  '--scene-portrait-object-position': string;
};

export function SceneArtwork({ sceneId, variant, className, fallback }: SceneArtworkProps) {
  const { registry, minimumStatus, fallbackPolicy } = useContext(ProductionArtContext);
  const asset = resolveSceneArtwork(registry, sceneId, variant, minimumStatus);

  if (!asset) {
    if (fallbackPolicy === 'alpha') return <>{fallback}</>;
    const label = variant ? `${sceneId}: ${variant}` : sceneId;
    return <BlockedArt kind="scene" label={label} className={className} />;
  }

  const responsiveStyle: ResponsiveSceneStyle = {
    objectFit: 'cover',
    '--scene-object-position': asset.objectPosition ?? '50% 50%',
    '--scene-portrait-object-position': asset.portraitObjectPosition ?? asset.objectPosition ?? '50% 50%'
  };
  const imageClassName = [className, 'production-scene-art'].filter(Boolean).join(' ');
  const image = (
    <img
      className={imageClassName}
      src={asset.src}
      width={asset.width}
      height={asset.height}
      alt={asset.alt}
      draggable={false}
      decoding="async"
      data-art-asset-id={asset.id}
      data-art-status={asset.status}
      data-responsive-art={asset.portraitSrc ? 'true' : 'false'}
      style={responsiveStyle}
    />
  );

  if (!asset.portraitSrc) return image;

  return (
    <picture data-responsive-art-asset-id={asset.id}>
      <source media="(orientation: portrait)" srcSet={asset.portraitSrc} />
      {image}
    </picture>
  );
}
