import { getStore } from '@netlify/blobs';

const DEFAULT_AVAILABLE = 4;
const MAX_AVAILABLE = 4;
const STORE_NAME = 'settings';
const POOL_KEY = 'pool';

export async function getPool(): Promise<{ available: number }> {
  const store = getStore(STORE_NAME);
  const data = await store.get(POOL_KEY, { type: 'json' }) as { available: number } | null;
  if (!data || typeof data.available !== 'number') {
    return { available: DEFAULT_AVAILABLE };
  }
  return { available: Math.max(0, Math.min(MAX_AVAILABLE, data.available)) };
}

export async function setPool(available: number): Promise<void> {
  const store = getStore(STORE_NAME);
  const clamped = Math.max(0, Math.min(MAX_AVAILABLE, Math.round(available)));
  await store.setJSON(POOL_KEY, { available: clamped });
}

export async function decrementPool(by: number): Promise<{ available: number } | null> {
  const pool = await getPool();
  if (pool.available < by) return null;
  const newAvailable = pool.available - by;
  await setPool(newAvailable);
  return { available: newAvailable };
}
