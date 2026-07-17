import { useEffect, useMemo, useState } from 'react';
import type { FamilyMemoryTheme, Memory, Pal, World } from '@pixel-pals/content-schema';
import { FamilyMemoryScene, type PalArtworkRequest, type PalSpecies } from '@pixel-pals/renderer';
import {
  FAMILY_BOND_LABELS,
  FAMILY_MEMORY_THEMES,
  recordFamilyMemory,
  removeFamilyMemory,
  type FamilyMemoryTone
} from '@pixel-pals/simulation';

const FAMILY_MEMORY_THEME_IDS = Object.keys(FAMILY_MEMORY_THEMES) as FamilyMemoryTheme[];
const FAMILY_MEMORY_TONES: FamilyMemoryTone[] = ['joyful', 'playful', 'calm', 'hopeful'];
const SUPPORTED_ART_SPECIES = new Set<PalSpecies>(['fox', 'deer', 'rabbit', 'cat', 'duck']);

type FamilyChronicleSectionProps = {
  world: World;
  saving: boolean;
  runWorldAction: (action: () => World) => void;
  onStatus: (message: string) => void;
};

function palArtwork(pal: Pal, expression: PalArtworkRequest['expression'] = 'content'): PalArtworkRequest | null {
  if (!SUPPORTED_ART_SPECIES.has(pal.speciesId as PalSpecies)) return null;
  return {
    name: pal.name,
    species: pal.speciesId as PalSpecies,
    artIdentity: pal.artIdentity,
    paletteId: pal.appearance.paletteId,
    markingId: pal.appearance.markingId,
    accessoryId: pal.appearance.accessoryId,
    expression,
    pose: 'standing'
  };
}

function memoryParticipants(world: World, memory: Memory): [Pal, Pal] | null {
  const first = world.pals.find((pal) => pal.id === memory.participantPalIds[0]);
  const second = world.pals.find((pal) => pal.id === memory.participantPalIds[1]);
  return first && second ? [first, second] : null;
}

function ChronicleScene({ world, memory }: { world: World; memory: Memory }) {
  const participants = memoryParticipants(world, memory);
  if (!memory.familyHistory || !participants) return null;
  const first = palArtwork(participants[0], memory.emotionalTone === 'calm' ? 'content' : 'delighted');
  const second = palArtwork(participants[1], 'delighted');
  if (!first || !second) return null;

  return (
    <FamilyMemoryScene
      sceneVariant={memory.familyHistory.sceneVariant}
      firstPal={first}
      companion={second}
    />
  );
}

export function FamilyChronicleSection({ world, saving, runWorldAction, onStatus }: FamilyChronicleSectionProps) {
  const [familyBondId, setFamilyBondId] = useState(world.familyBonds[0]?.id ?? '');
  const [householdId, setHouseholdId] = useState('');
  const [sceneVariant, setSceneVariant] = useState<FamilyMemoryTheme>('welcome-home');
  const [emotionalTone, setEmotionalTone] = useState<FamilyMemoryTone>('hopeful');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');

  const selectedBond = useMemo(
    () => world.familyBonds.find((bond) => bond.id === familyBondId),
    [familyBondId, world.familyBonds]
  );
  const eligibleHomes = useMemo(() => selectedBond
    ? world.homes.filter((home) => home.residentPalIds.includes(selectedBond.fromPalId)
      || home.residentPalIds.includes(selectedBond.toPalId))
    : [], [selectedBond, world.homes]);
  const familyMemories = useMemo(
    () => world.memories.filter((memory) => Boolean(memory.familyHistory)).reverse(),
    [world.memories]
  );

  useEffect(() => {
    if (!world.familyBonds.some((bond) => bond.id === familyBondId)) {
      setFamilyBondId(world.familyBonds[0]?.id ?? '');
    }
  }, [familyBondId, world.familyBonds, world.worldId]);

  useEffect(() => {
    if (!eligibleHomes.some((home) => home.id === householdId)) {
      setHouseholdId(eligibleHomes[0]?.id ?? '');
    }
  }, [eligibleHomes, householdId]);

  function handleThemeChange(nextTheme: FamilyMemoryTheme): void {
    setSceneVariant(nextTheme);
    setEmotionalTone(FAMILY_MEMORY_THEMES[nextTheme].defaultTone);
  }

  function handleRecord(): void {
    try {
      const nextWorld = recordFamilyMemory(world, {
        familyBondId,
        householdId,
        title,
        summary,
        emotionalTone,
        sceneVariant
      });
      runWorldAction(() => nextWorld);
      setTitle('');
      setSummary('');
      onStatus('The family moment was saved to the household, Memory Journal, and Great Tree.');
    } catch (error) {
      onStatus(error instanceof Error ? error.message : 'That family moment could not be saved.');
    }
  }

  function handleRemove(memory: Memory): void {
    runWorldAction(() => removeFamilyMemory(world, memory.id));
    onStatus('The family moment was removed from the household, Memory Journal, and Great Tree.');
  }

  const canRecord = Boolean(familyBondId && householdId && title.trim() && summary.trim() && !saving);

  return (
    <section
      className="family-chronicle"
      aria-labelledby="family-chronicle-title"
      data-family-memory-count={familyMemories.length}
    >
      <div className="family-chronicle-heading">
        <div>
          <p className="eyebrow">Household history · adult view</p>
          <h2 id="family-chronicle-title">Family Chronicle</h2>
        </div>
        <span className="family-chronicle-count">{familyMemories.length} remembered</span>
      </div>
      <p>
        Record a family moment once. It becomes part of the household history, the shared Memory Journal, and the village Great Tree.
      </p>
      <p className="family-art-contract">
        Family environments use the reusable <code>family-memory</code> scene slot. Pal identities remain shared artwork overlays, not duplicate Chronicle portraits.
      </p>

      {world.familyBonds.length === 0 ? (
        <p className="family-chronicle-empty">Record a family bond in the Family Map before adding a family memory.</p>
      ) : (
        <div className="family-chronicle-editor" aria-label="Record a family memory">
          <label>
            <span>Family bond</span>
            <select aria-label="Chronicle family bond" value={familyBondId} onChange={(event) => setFamilyBondId(event.target.value)}>
              {world.familyBonds.map((bond) => {
                const fromPal = world.pals.find((pal) => pal.id === bond.fromPalId);
                const toPal = world.pals.find((pal) => pal.id === bond.toPalId);
                return (
                  <option key={bond.id} value={bond.id}>
                    {fromPal?.name ?? 'Pal'} + {toPal?.name ?? 'Pal'} · {FAMILY_BOND_LABELS[bond.kind]}
                  </option>
                );
              })}
            </select>
          </label>
          <label>
            <span>Household</span>
            <select aria-label="Chronicle household" value={householdId} onChange={(event) => setHouseholdId(event.target.value)}>
              {eligibleHomes.map((home) => (
                <option key={home.id} value={home.id}>
                  {world.villages.find((village) => village.id === home.villageId)?.name ?? home.villageId} home
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Scene theme</span>
            <select
              aria-label="Chronicle scene theme"
              value={sceneVariant}
              onChange={(event) => handleThemeChange(event.target.value as FamilyMemoryTheme)}
            >
              {FAMILY_MEMORY_THEME_IDS.map((theme) => (
                <option key={theme} value={theme}>{FAMILY_MEMORY_THEMES[theme].label}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Emotional tone</span>
            <select aria-label="Chronicle emotional tone" value={emotionalTone} onChange={(event) => setEmotionalTone(event.target.value as FamilyMemoryTone)}>
              {FAMILY_MEMORY_TONES.map((tone) => <option key={tone} value={tone}>{tone}</option>)}
            </select>
          </label>
          <label className="family-chronicle-title-field">
            <span>Memory title</span>
            <input
              aria-label="Chronicle memory title"
              maxLength={80}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="The day our doorway became theirs"
            />
          </label>
          <label className="family-chronicle-summary-field">
            <span>What happened?</span>
            <textarea
              aria-label="Chronicle memory summary"
              maxLength={500}
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              placeholder="Write the short, concrete moment the family chose to remember."
              rows={3}
            />
          </label>
          <p className="tool-note family-chronicle-theme-help">{FAMILY_MEMORY_THEMES[sceneVariant].description}</p>
          <button className="adult-action family-memory-record" type="button" disabled={!canRecord} onClick={handleRecord}>
            Save family memory
          </button>
        </div>
      )}

      <div className="family-chronicle-list" aria-live="polite">
        {familyMemories.length === 0 ? (
          <p className="family-chronicle-empty">No family moments are recorded yet.</p>
        ) : familyMemories.map((memory) => (
          <article className="family-chronicle-entry" key={memory.id} data-family-memory-id={memory.id}>
            <ChronicleScene world={world} memory={memory} />
            <div className="family-chronicle-copy">
              <span className="memory-meta">Day {memory.worldDay + 1}</span>
              <h3>{memory.title}</h3>
              <p>{memory.summary}</p>
              <button
                className="adult-action secondary-adult-action family-memory-remove"
                type="button"
                disabled={saving}
                onClick={() => handleRemove(memory)}
              >
                Remove family memory
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
