import { type MutableRefObject, useEffect, useRef, useState } from 'react';
import type { World } from '@pixel-pals/content-schema';
import { loadWorld, saveWorld } from '@pixel-pals/persistence';

export type WorldSave = {
  world: World | null;
  loading: boolean;
  saving: boolean;
  saveStatus: string;
  setSaveStatus: (message: string) => void;
  setWorldDirect: (world: World | null) => void;
  persist: (nextWorld: World) => Promise<void>;
  runWorldAction: (action: () => World) => void;
};

type PersistContext = {
  saveInFlight: MutableRefObject<boolean>;
  previousWorld: World | null;
  setWorld: (world: World | null) => void;
  setSaving: (saving: boolean) => void;
  setSaveStatus: (message: string) => void;
};

async function persistWorld(context: PersistContext, nextWorld: World): Promise<void> {
  if (context.saveInFlight.current) return;

  context.saveInFlight.current = true;
  context.setSaving(true);
  context.setWorld(nextWorld);
  context.setSaveStatus('Saving your world…');

  try {
    await saveWorld(nextWorld);
    context.setSaveStatus('Saved. Your world will remember this.');
  } catch {
    context.setWorld(context.previousWorld);
    context.setSaveStatus('That change could not be saved, so the world returned to its last safe state.');
  } finally {
    context.saveInFlight.current = false;
    context.setSaving(false);
  }
}

export function useWorldSave(): WorldSave {
  const [world, setWorld] = useState<World | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('Your world is safe on this tablet.');
  const saveInFlight = useRef(false);

  useEffect(() => {
    void loadWorld()
      .then((savedWorld) => setWorld(savedWorld))
      .catch(() => setSaveStatus('We could not open a valid saved world. No data was erased.'))
      .finally(() => setLoading(false));
  }, []);

  const context: PersistContext = { saveInFlight, previousWorld: world, setWorld, setSaving, setSaveStatus };
  const persist = (nextWorld: World) => persistWorld(context, nextWorld);

  return {
    world,
    loading,
    saving,
    saveStatus,
    setSaveStatus,
    setWorldDirect: setWorld,
    persist,
    runWorldAction: (action: () => World) => {
      if (saveInFlight.current) return;
      try {
        void persist(action());
      } catch {
        setSaveStatus('That action did not fit the current world state. Nothing changed.');
      }
    }
  };
}
