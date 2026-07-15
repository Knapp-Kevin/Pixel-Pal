import { useState } from 'react';
import type { World } from '@pixel-pals/content-schema';
import { ParentAccessGate } from './parentGate/ParentAccessGate';
import { BackupSection } from './parentTools/BackupSection';
import { ObservationSection } from './parentTools/ObservationSection';
import { ResetSection } from './parentTools/ResetSection';
import { firstPalName, safeFilename } from './parentTools/playtestExport';

type ParentTestToolsProps = {
  world: World;
  onResetComplete: () => void;
  onStatus: (message: string) => void;
};

export function ParentTestTools({ world, onResetComplete, onStatus }: ParentTestToolsProps) {
  const [backupExported, setBackupExported] = useState(false);
  const currentFirstPalName = firstPalName(world);
  const baseFilename = safeFilename(currentFirstPalName || world.worldName);

  return (
    <ParentAccessGate>
      <div className="parent-tools-panel">
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
          onStatus={onStatus}
          onResetComplete={onResetComplete}
        />
      </div>
    </ParentAccessGate>
  );
}
