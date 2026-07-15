import type { Pal, World } from '@pixel-pals/content-schema';
import { ACTIVITY_LABELS, type FirstActivity } from './activities';
import type { WorldDayInvitation } from './dayInvitations';

type PreferenceSpec = {
  id: string;
  kind: Pal['preferences'][number]['kind'];
  subjectId: string;
  label: string;
};

function activePreference(activity: FirstActivity): PreferenceSpec {
  return {
    id: `activity-${activity}`,
    kind: 'activity',
    subjectId: activity,
    label: `Enjoys ${ACTIVITY_LABELS[activity]} with a friend`
  };
}

export function preferenceForInvitation(invitation: WorldDayInvitation): PreferenceSpec {
  if (invitation.kind === 'active' && invitation.activityId) return activePreference(invitation.activityId as FirstActivity);
  if (invitation.kind === 'quiet') {
    return {
      id: 'quiet-noticing',
      kind: 'social',
      subjectId: 'quiet-noticing',
      label: 'Enjoys noticing quiet details with a trusted friend'
    };
  }
  if (invitation.kind === 'home' && invitation.homeObjectId) {
    return {
      id: `home-${invitation.homeObjectId}`,
      kind: 'object',
      subjectId: invitation.homeObjectId,
      label: `Enjoys sharing time around the ${invitation.homeObjectId.replaceAll('-', ' ')}`
    };
  }
  return {
    id: 'village-helping',
    kind: 'activity',
    subjectId: 'village-helping',
    label: 'Enjoys caring for Willowmere alongside a friend'
  };
}

export function preferenceEvidence(world: World, subjectId: string): number {
  const firstPal = world.pals.find((pal) => pal.id === world.firstPalId);
  return firstPal?.preferences
    .filter((preference) => preference.discovered && preference.subjectId === subjectId)
    .reduce((total, preference) => total + preference.evidenceCount, 0) ?? 0;
}

export function updatePreferenceForInvitation(
  pals: World['pals'],
  palId: string,
  invitation: WorldDayInvitation
): World['pals'] {
  const spec = preferenceForInvitation(invitation);

  return pals.map((pal) => {
    if (pal.id !== palId) return pal;
    const existingIndex = pal.preferences.findIndex((preference) =>
      preference.subjectId === spec.subjectId
      || (invitation.kind === 'active' && preference.id === 'first-play-preference')
    );

    if (existingIndex < 0) {
      return {
        ...pal,
        preferences: [
          ...pal.preferences,
          { ...spec, discovered: true, evidenceCount: 1 }
        ]
      };
    }

    return {
      ...pal,
      preferences: pal.preferences.map((preference, index) => index === existingIndex
        ? {
            ...preference,
            kind: spec.kind,
            subjectId: spec.subjectId,
            label: spec.label,
            discovered: true,
            evidenceCount: Math.min(100, preference.discovered ? preference.evidenceCount + 1 : 1)
          }
        : preference)
    };
  });
}
