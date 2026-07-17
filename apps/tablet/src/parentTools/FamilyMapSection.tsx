import { useEffect, useMemo, useState } from 'react';
import type { FamilyBond, FamilyBondKind, Pal, World } from '@pixel-pals/content-schema';
import { PalArtwork, type PalSpecies } from '@pixel-pals/renderer';
import {
  addFamilyBond,
  FAMILY_BOND_HELP,
  FAMILY_BOND_LABELS,
  removeFamilyBond
} from '@pixel-pals/simulation';

const FAMILY_BOND_KINDS = Object.keys(FAMILY_BOND_LABELS) as FamilyBondKind[];
const CAREGIVING_KINDS = new Set<FamilyBondKind>(['biological-parent', 'adoptive-parent', 'guardian']);
const SUPPORTED_ART_SPECIES = new Set<PalSpecies>(['fox', 'deer', 'rabbit', 'cat', 'duck']);

const BOND_MARKERS: Record<FamilyBondKind, string> = {
  'biological-parent': 'BIO',
  'adoptive-parent': 'ADOPT',
  guardian: 'GUARD',
  sibling: 'SIB',
  'chosen-family': 'CHOSEN'
};

type FamilyMapSectionProps = {
  world: World;
  saving: boolean;
  runWorldAction: (action: () => World) => void;
  onStatus: (message: string) => void;
};

function supportedSpecies(speciesId: string): PalSpecies | null {
  return SUPPORTED_ART_SPECIES.has(speciesId as PalSpecies) ? speciesId as PalSpecies : null;
}

function PalCard({ pal, world }: { pal: Pal; world: World }) {
  const species = supportedSpecies(pal.speciesId);
  const speciesLabel = world.species.find((candidate) => candidate.id === pal.speciesId)?.name ?? pal.speciesId;

  return (
    <article className="family-pal-card" data-family-pal-id={pal.id} data-reusable-art="pal-artwork">
      <div className="family-pal-art-frame">
        {species ? (
          <PalArtwork
            className="family-map-pal-art"
            name={pal.name}
            species={species}
            artIdentity={pal.artIdentity}
            paletteId={pal.appearance.paletteId}
            markingId={pal.appearance.markingId}
            accessoryId={pal.appearance.accessoryId}
            expression="content"
            pose="standing"
          />
        ) : (
          <div className="family-pal-art-missing" role="img" aria-label={`${pal.name}, artwork not yet available`}>
            Artwork slot ready
          </div>
        )}
      </div>
      <div>
        <h3>{pal.name}</h3>
        <p>{speciesLabel} · {pal.lifeStage}</p>
      </div>
    </article>
  );
}

function bondSentence(bond: FamilyBond, fromPal: Pal, toPal: Pal): string {
  if (bond.kind === 'sibling') return `${fromPal.name} and ${toPal.name} are siblings.`;
  if (bond.kind === 'chosen-family') return `${fromPal.name} and ${toPal.name} recognize each other as chosen family.`;
  if (bond.kind === 'guardian') return `${fromPal.name} is guardian to ${toPal.name}.`;
  if (bond.kind === 'adoptive-parent') return `${fromPal.name} is adoptive parent to ${toPal.name}.`;
  return `${fromPal.name} is biological parent to ${toPal.name}.`;
}

function BondCard({
  bond,
  world,
  saving,
  onRemove
}: {
  bond: FamilyBond;
  world: World;
  saving: boolean;
  onRemove: (bond: FamilyBond) => void;
}) {
  const fromPal = world.pals.find((pal) => pal.id === bond.fromPalId);
  const toPal = world.pals.find((pal) => pal.id === bond.toPalId);
  if (!fromPal || !toPal) return null;

  return (
    <article className="family-bond-card" data-family-bond-id={bond.id} data-family-kind={bond.kind}>
      <span className={`family-bond-marker family-bond-marker-${bond.kind}`} aria-hidden="true">
        {BOND_MARKERS[bond.kind]}
      </span>
      <div className="family-bond-copy">
        <h3>{FAMILY_BOND_LABELS[bond.kind]}</h3>
        <p>{bondSentence(bond, fromPal, toPal)}</p>
        <p className="tool-note">Recorded on world day {bond.establishedWorldDay + 1}.</p>
      </div>
      <button
        className="adult-action secondary-adult-action family-bond-remove"
        type="button"
        disabled={saving}
        onClick={() => onRemove(bond)}
      >
        Remove
      </button>
    </article>
  );
}

export function FamilyMapSection({ world, saving, runWorldAction, onStatus }: FamilyMapSectionProps) {
  const firstOtherPalId = world.pals.find((pal) => pal.id !== world.firstPalId)?.id ?? world.firstPalId;
  const [kind, setKind] = useState<FamilyBondKind>('chosen-family');
  const [fromPalId, setFromPalId] = useState(world.firstPalId);
  const [toPalId, setToPalId] = useState(firstOtherPalId);

  useEffect(() => {
    setKind('chosen-family');
    setFromPalId(world.firstPalId);
    setToPalId(world.pals.find((pal) => pal.id !== world.firstPalId)?.id ?? world.firstPalId);
  }, [world.firstPalId, world.worldId, world.pals]);

  const fromPal = useMemo(() => world.pals.find((pal) => pal.id === fromPalId), [fromPalId, world.pals]);
  const toPal = useMemo(() => world.pals.find((pal) => pal.id === toPalId), [toPalId, world.pals]);
  const canAdd = Boolean(fromPal && toPal && fromPal.id !== toPal.id && !saving);

  function handleAdd(): void {
    if (!fromPal || !toPal || fromPal.id === toPal.id) {
      onStatus('Choose two different Pals before adding a family bond.');
      return;
    }

    try {
      const nextWorld = addFamilyBond(world, { kind, fromPalId: fromPal.id, toPalId: toPal.id });
      if (nextWorld === world) {
        onStatus('That family bond is already recorded.');
        return;
      }
      runWorldAction(() => nextWorld);
      onStatus(`${FAMILY_BOND_LABELS[kind]} bond added to the local family map.`);
    } catch (error) {
      onStatus(error instanceof Error ? error.message : 'That family bond could not be added.');
    }
  }

  function handleRemove(bond: FamilyBond): void {
    const nextWorld = removeFamilyBond(world, bond.id);
    runWorldAction(() => nextWorld);
    onStatus(`${FAMILY_BOND_LABELS[bond.kind]} bond removed from the local family map.`);
  }

  return (
    <section
      className="family-map"
      aria-labelledby="family-map-title"
      data-family-bond-count={world.familyBonds.length}
    >
      <div className="family-map-heading">
        <div>
          <p className="eyebrow">Family and belonging · adult view</p>
          <h2 id="family-map-title">Family Map</h2>
        </div>
        <span className="family-map-count">{world.familyBonds.length} recorded</span>
      </div>
      <p>
        Record how Pals understand their family. Friendship, household, personality, culture, and genetics remain separate systems.
      </p>
      <p className="family-art-contract">
        Every Pal portrait below uses the shared production-art registry. Approved artwork replaces the fallback everywhere without a Family Map-specific duplicate.
      </p>

      <div className="family-pal-grid" aria-label="Pals available to the family map">
        {world.pals.map((pal) => <PalCard key={pal.id} pal={pal} world={world} />)}
      </div>

      <div className="family-bond-editor" aria-label="Add a family bond">
        <label>
          <span>Family bond</span>
          <select aria-label="Family bond type" value={kind} onChange={(event) => setKind(event.target.value as FamilyBondKind)}>
            {FAMILY_BOND_KINDS.map((option) => (
              <option key={option} value={option}>{FAMILY_BOND_LABELS[option]}</option>
            ))}
          </select>
        </label>
        <label>
          <span>{CAREGIVING_KINDS.has(kind) ? 'Parent or guardian' : 'First Pal'}</span>
          <select aria-label="Family bond from Pal" value={fromPalId} onChange={(event) => setFromPalId(event.target.value)}>
            {world.pals.map((pal) => <option key={pal.id} value={pal.id}>{pal.name}</option>)}
          </select>
        </label>
        <label>
          <span>{CAREGIVING_KINDS.has(kind) ? 'Child or dependent' : 'Second Pal'}</span>
          <select aria-label="Family bond to Pal" value={toPalId} onChange={(event) => setToPalId(event.target.value)}>
            {world.pals.map((pal) => <option key={pal.id} value={pal.id}>{pal.name}</option>)}
          </select>
        </label>
        <button className="adult-action family-bond-add" type="button" disabled={!canAdd} onClick={handleAdd}>
          Add family bond
        </button>
      </div>
      <p className="tool-note family-bond-help">{FAMILY_BOND_HELP[kind]}</p>

      <div className="family-bond-list" aria-live="polite">
        {world.familyBonds.length === 0 ? (
          <p className="family-map-empty">No family bonds are recorded yet. This does not mean the Pals are without belonging.</p>
        ) : world.familyBonds.map((bond) => (
          <BondCard key={bond.id} bond={bond} world={world} saving={saving} onRemove={handleRemove} />
        ))}
      </div>
    </section>
  );
}