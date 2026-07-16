import { useEffect, useState } from 'react';
import type { World } from '@pixel-pals/content-schema';
import type { WorldSummary } from '@pixel-pals/persistence';
import { ParentAccessGate } from './parentGate/ParentAccessGate';
import { AccessibilitySection } from './parentTools/AccessibilitySection';
import { BackupSection } from './parentTools/BackupSection';
import { ObservationSection } from './parentTools/ObservationSection';
import { ResetSection } from './parentTools/ResetSection';
import { WorldManagementSection } from './parentTools/WorldManagementSection';
import { firstPalName, safeFilename } from './parentTools/playtestExport';

type ParentTestToolsProps = {
  world: World;
  worlds: WorldSummary[];
  onStartNewWorld: () => void;
  onDeleteWorld: () => Promise<void>;
  onStatus: (message: string) => void;
};

export function ParentTestTools({ world, worlds, onStartNewWorld, onDeleteWorld, onStatus }: ParentTestToolsProps) {
  const [backupExported, setBackupExported] = useState(false);
  const currentFirstPalName = firstPalName(world);
  const baseFilename = safeFilename(currentFirstPalName || world.worldName);

  useEffect(() => {
    setBackupExported(false);
  }, [world.worldId]);

  return (
    <ParentAccessGate>
      <div className="parent-tools-panel">
        <AccessibilitySection onStatus={onStatus} />
        <WorldManagementSection worlds={worlds} onStartNewWorld={onStartNewWorld} />
        <BackupSection
          world={world}
          baseFilename={baseFilename}
          onStatus={onStatus}
          onExported={() => setBackupExported(true)}
        />
        <ObservationSection world={world} baseFilename={baseFilename} onStatus={onStatus} />
        <ResetSection
          firstPalName={currentFirstPalName}
          backupExported={backupExported}
          otherWorldCount={Math.max(0, worlds.length - 1)}
          onStatus={onStatus}
          onDeleteWorld={onDeleteWorld}
        />
      </div>
    </ParentAccessGate>
  );
}
