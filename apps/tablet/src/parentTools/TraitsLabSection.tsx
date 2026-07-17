import { useMemo, useState } from 'react';
import type { World } from '@pixel-pals/content-schema';
import { createInheritancePreview, type InheritedTraitOutcome } from '@pixel-pals/simulation';

const SAMPLE_COUNT = 4;

type TraitsLabSectionProps = {
  world: World;
  onStatus: (message: string) => void;
};

function OutcomeCard({ outcome }: { outcome: InheritedTraitOutcome }) {
  return (
    <article className="trait-outcome-card" data-trait-locus={outcome.locus}>
      <div className="trait-outcome-heading">
        <div>
          <p className="eyebrow">{outcome.label}</p>
          <h3>{outcome.expressed.label}</h3>
        </div>
        <span className="trait-state trait-state-expressed">Expressed</span>
      </div>
      <div className="trait-source-grid">
        {outcome.inherited.map((allele) => (
          <div key={`${allele.sourcePalId}-${allele.id}`} className="trait-source">
            <span>{allele.sourcePalName} contributed</span>
            <strong>{allele.label}</strong>
          </div>
        ))}
      </div>
      {outcome.carried ? (
        <p className="trait-carried">
          <span className="trait-state trait-state-carried">Carried</span>
          {outcome.carried.label}
        </p>
      ) : (
        <p className="trait-carried">No different carried allele in this sample.</p>
      )}
      <p className="tool-note">{outcome.explanation}</p>
    </article>
  );
}

export function TraitsLabSection({ world, onStatus }: TraitsLabSectionProps) {
  const firstPal = world.pals.find((pal) => pal.id === world.firstPalId);
  const neighbor = world.pals.find((pal) => pal.storyRole === 'first-neighbor');
  const [sampleIndex, setSampleIndex] = useState(0);

  const preview = useMemo(() => {
    if (!firstPal || !neighbor) return null;
    return createInheritancePreview(world, firstPal.id, neighbor.id, sampleIndex);
  }, [firstPal, neighbor, sampleIndex, world]);

  if (!firstPal || !neighbor || !preview) {
    return (
      <section aria-labelledby="traits-lab-title">
        <h2 id="traits-lab-title">Traits Lab</h2>
        <p>This world does not yet contain two compatible Pal profiles for the inheritance learning preview.</p>
      </section>
    );
  }

  function changeSample(nextIndex: number): void {
    const normalized = (nextIndex + SAMPLE_COUNT) % SAMPLE_COUNT;
    setSampleIndex(normalized);
    onStatus(`Traits Lab sample ${normalized + 1} of ${SAMPLE_COUNT} is ready.`);
  }

  return (
    <section className="traits-lab" aria-labelledby="traits-lab-title" data-traits-lab-sample={preview.sampleNumber}>
      <div className="traits-lab-heading">
        <div>
          <p className="eyebrow">Family and inheritance · adult learning view</p>
          <h2 id="traits-lab-title">Traits Lab</h2>
        </div>
        <span className="traits-sample-count">Sample {preview.sampleNumber} of {SAMPLE_COUNT}</span>
      </div>
      <p>
        Compare possible inherited appearance from {firstPal.name} and {neighbor.name}. Each sample receives one allele from each Pal at every supported locus.
      </p>
      <p className="traits-boundary">{preview.learningBoundary}</p>

      <div className="traits-profile-grid" aria-label="Source Pal trait profiles">
        {preview.sourceProfiles.map((profile) => (
          <article key={profile.palId} className="trait-profile-card">
            <h3>{profile.palName}</h3>
            <dl>
              <div>
                <dt>Palette alleles</dt>
                <dd>{profile.loci.palette.map((allele) => allele.label).join(' + ')}</dd>
              </div>
              <div>
                <dt>Marking alleles</dt>
                <dd>{profile.loci.marking.map((allele) => allele.label).join(' + ')}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <div className="trait-outcome-grid" aria-live="polite">
        {preview.outcomes.map((outcome) => <OutcomeCard key={outcome.locus} outcome={outcome} />)}
      </div>

      <div className="adult-action-row traits-lab-actions">
        <button className="adult-action secondary-adult-action" type="button" onClick={() => changeSample(sampleIndex - 1)}>
          Previous sample
        </button>
        <button className="adult-action" type="button" onClick={() => changeSample(sampleIndex + 1)}>
          Next sample
        </button>
      </div>
    </section>
  );
}
