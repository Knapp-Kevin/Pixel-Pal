import { type MutableRefObject, useEffect, useRef, useState } from 'react';
import type { World } from '@pixel-pals/content-schema';
import {
  deleteWorld,
  listWorlds,
  loadWorld,
  saveWorld,
  selectWorld,
  type WorldSummary
} from '@pixel-pals/persistence';

export type WorldSave = {
  world: World | null;
  worlds: WorldSummary[];
  loading: boolean;
  saving: boolean;
  saveStatus: string;
  setSaveStatus: (message: string) => void;
  setWorldDirect: (world: World | null) => void;
  persist: (nextWorld: World) => Promise<void>;
  runWorldAction: (action: () => World) => void;
  switchWorld: (worldId: string) => Promise<void>;
  removeWorld: (worldId: string) => Promise<void>;
};

type PersistContext = {
  saveInFlight: MutableRefObject<boolean>;
  previousWorld: World | null;
  setWorld: (world: World | null) => void;
  setWorlds: (worlds: WorldSummary[]) => void;
  setSaving: (saving: boolean) => void;
  setSaveStatus: (message: string) => void;
};

async function refreshWorldSummaries(setWorlds: (worlds: WorldSummary[]) => void): Promise<void> {
  setWorlds(await listWorlds());
}

async function persistWorld(context: PersistContext, nextWorld: World): Promise<void> {
  if (context.saveInFlight.current) return;

  context.saveInFlight.current = true;
  context.setSaving(true);
  context.setWorld(nextWorld);
  context.setSaveStatus('Saving your world…');

  try {
    await saveWorld(nextWorld);
    await refreshWorldSummaries(context.setWorlds);
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
  const [worlds, setWorlds] = useState<WorldSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('Your world is safe on this tablet.');
  const saveInFlight = useRef(false);

  useEffect(() => {
    void loadWorld()
      .then(async (savedWorld) => {
        setWorld(savedWorld);
        await refreshWorldSummaries(setWorlds);
      })
      .catch(() => setSaveStatus('We could not open a valid saved world. No data was erased.'))
      .finally(() => setLoading(false));
  }, []);

  const context: PersistContext = {
    saveInFlight,
    previousWorld: world,
    setWorld,
    setWorlds,
    setSaving,
    setSaveStatus
  };
  const persist = (nextWorld: World) => persistWorld(context, nextWorld);

  async function switchWorld(worldId: string): Promise<void> {
    if (saveInFlight.current || world?.worldId === worldId) return;
    saveInFlight.current = true;
    setSaving(true);
    setSaveStatus('Opening that local world…');

    try {
      const selected = await selectWorld(worldId);
      setWorld(selected);
      await refreshWorldSummaries(setWorlds);
      const firstPal = selected.pals.find((pal) => pal.id === selected.firstPalId);
      setSaveStatus(`${firstPal?.name ?? 'This Pal'}’s world is ready.`);
    } catch {
      setSaveStatus('That local world could not be opened. The current world is unchanged.');
    } finally {
      saveInFlight.current = false;
      setSaving(false);
    }
  }

  async function removeWorld(worldId: string): Promise<void> {
    if (saveInFlight.current) return;
    saveInFlight.current = true;
    setSaving(true);
    setSaveStatus('Removing this local world…');

    try {
      const nextWorld = await deleteWorld(worldId);
      setWorld(nextWorld);
      await refreshWorldSummaries(setWorlds);
      setSaveStatus(nextWorld ? 'The selected world was removed. Another local world is ready.' : 'The local world was removed. A new story can begin.');
    } catch {
      setSaveStatus('That world could not be removed. Its save remains available.');
    } finally {
      saveInFlight.current = false;
      setSaving(false);
    }
  }

  return {
    world,
    worlds,
    loading,
    saving,
    saveStatus,
    setSaveStatus,
    setWorldDirect: setWorld,
    persist,
    switchWorld,
    removeWorld,
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
