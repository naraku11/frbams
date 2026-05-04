import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import {
  clearSyncedItems,
  enqueueOfflineItem,
  getOfflineQueue,
  getOrCreateDeviceUuid,
  markQueueItemSynced,
} from '../lib/storage';
import type { OfflineQueueItem } from '../lib/types';
import { useNetworkStatus } from './useNetworkStatus';

export function useOfflineQueue() {
  const isOnline    = useNetworkStatus();
  const [queue, setQueue] = useState<OfflineQueueItem[]>([]);
  const isSyncing   = useRef(false);
  const pendingCount = queue.filter((i) => !i.synced).length;

  const refresh = useCallback(async () => {
    const q = await getOfflineQueue();
    setQueue(q);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // Auto-sync when connection is restored — guard against concurrent syncs
  useEffect(() => {
    if (!isOnline || pendingCount === 0) return;
    if (isSyncing.current) return;

    isSyncing.current = true;
    (async () => {
      try {
        const allItems = await getOfflineQueue();
        const pending  = allItems.filter((i) => !i.synced);
        if (pending.length === 0) return;

        const deviceUuid = await getOrCreateDeviceUuid();
        const payload    = pending.map((i) => ({ ...i, deviceUuid }));
        await api.attendance.syncOfflineQueue(payload);

        for (const item of pending) {
          await markQueueItemSynced(item.localId);
        }
        await clearSyncedItems();
        await refresh();
      } catch {
        // Will retry on next reconnect event
      } finally {
        isSyncing.current = false;
      }
    })();
  }, [isOnline]); // eslint-disable-line react-hooks/exhaustive-deps

  const enqueue = useCallback(
    async (item: Omit<OfflineQueueItem, 'localId' | 'synced'>) => {
      const queueItem: OfflineQueueItem = {
        ...item,
        localId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        synced: false,
      };
      await enqueueOfflineItem(queueItem);
      await refresh();
      return queueItem;
    },
    [refresh],
  );

  return { queue, pendingCount, enqueue, refresh };
}
