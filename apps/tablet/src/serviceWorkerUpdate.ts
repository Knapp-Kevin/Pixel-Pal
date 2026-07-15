export type ApplyServiceWorkerUpdate = () => Promise<void>;

type Listener = (applyUpdate: ApplyServiceWorkerUpdate | null) => void;

let pendingUpdate: ApplyServiceWorkerUpdate | null = null;
const listeners = new Set<Listener>();

export function setPendingServiceWorkerUpdate(applyUpdate: ApplyServiceWorkerUpdate): void {
  pendingUpdate = applyUpdate;
  for (const listener of listeners) listener(pendingUpdate);
}

export function clearPendingServiceWorkerUpdate(): void {
  pendingUpdate = null;
  for (const listener of listeners) listener(null);
}

export function subscribeToServiceWorkerUpdate(listener: Listener): () => void {
  listeners.add(listener);
  listener(pendingUpdate);
  return () => listeners.delete(listener);
}
