import { useEffect, useState } from 'react';
import {
  clearPendingServiceWorkerUpdate,
  subscribeToServiceWorkerUpdate,
  type ApplyServiceWorkerUpdate
} from './serviceWorkerUpdate';

export function ServiceWorkerUpdateNotice() {
  const [applyUpdate, setApplyUpdate] = useState<ApplyServiceWorkerUpdate | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => subscribeToServiceWorkerUpdate(setApplyUpdate), []);

  if (!applyUpdate) return null;

  return (
    <aside className="update-notice" role="status" aria-live="polite">
      <div>
        <strong>A new Pixel Pals build is ready.</strong>
        <span>Your saved world is already safe. Update when this session is finished.</span>
      </div>
      <button
        type="button"
        disabled={updating}
        onClick={() => {
          setUpdating(true);
          void applyUpdate()
            .then(() => clearPendingServiceWorkerUpdate())
            .catch(() => setUpdating(false));
        }}
      >
        {updating ? 'Updating…' : 'Update and reopen'}
      </button>
    </aside>
  );
}
