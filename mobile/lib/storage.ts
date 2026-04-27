import AsyncStorage from '@react-native-async-storage/async-storage';
import type { OfflineQueueItem, Student } from './types';

const KEY = {
  token:        'auth_token',
  student:      'cached_student',
  deviceUuid:   'device_uuid',
  offlineQueue: 'offline_queue',
  schedule:     'cached_schedule',
  termRate:     'cached_term_rate',
} as const;

// ── Auth ─────────────────────────────────────────────────────────────────────
export async function saveToken(token: string) {
  await AsyncStorage.setItem(KEY.token, token);
}
export async function getToken() {
  return AsyncStorage.getItem(KEY.token);
}
export async function clearToken() {
  await AsyncStorage.removeItem(KEY.token);
}

// ── Student cache ─────────────────────────────────────────────────────────────
export async function saveStudent(s: Student) {
  await AsyncStorage.setItem(KEY.student, JSON.stringify(s));
}
export async function getCachedStudent(): Promise<Student | null> {
  const raw = await AsyncStorage.getItem(KEY.student);
  return raw ? (JSON.parse(raw) as Student) : null;
}

// ── Device UUID ──────────────────────────────────────────────────────────────
export async function getOrCreateDeviceUuid(): Promise<string> {
  let id = await AsyncStorage.getItem(KEY.deviceUuid);
  if (!id) {
    id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
    await AsyncStorage.setItem(KEY.deviceUuid, id);
  }
  return id;
}

// ── Offline queue ────────────────────────────────────────────────────────────
export async function getOfflineQueue(): Promise<OfflineQueueItem[]> {
  const raw = await AsyncStorage.getItem(KEY.offlineQueue);
  return raw ? (JSON.parse(raw) as OfflineQueueItem[]) : [];
}
export async function enqueueOfflineItem(item: OfflineQueueItem) {
  const q = await getOfflineQueue();
  await AsyncStorage.setItem(KEY.offlineQueue, JSON.stringify([...q, item]));
}
export async function markQueueItemSynced(localId: string) {
  const q = await getOfflineQueue();
  const updated = q.map((i) => (i.localId === localId ? { ...i, synced: true } : i));
  await AsyncStorage.setItem(KEY.offlineQueue, JSON.stringify(updated));
}
export async function clearSyncedItems() {
  const q = await getOfflineQueue();
  await AsyncStorage.setItem(KEY.offlineQueue, JSON.stringify(q.filter((i) => !i.synced)));
}

// ── Generic cache helpers ────────────────────────────────────────────────────
export async function cacheJson<T>(key: string, value: T) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}
export async function readCachedJson<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : null;
}
export { KEY as CACHE_KEYS };
