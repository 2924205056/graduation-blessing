import { Blessing } from '@/types/blessing';

const memoryStore: { list: Blessing[] } = { list: [] };

function envVal(key: string): string | undefined {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return undefined;
}

function isCloudflareKVConfigured(): boolean {
  return Boolean(
    envVal('CLOUDFLARE_API_TOKEN') &&
    envVal('CLOUDFLARE_ACCOUNT_ID') &&
    envVal('CLOUDFLARE_KV_NAMESPACE_ID')
  );
}

const KV_KEY = 'blessing:data';

function kvUrl(key: string): string {
  return `https://api.cloudflare.com/client/v4/accounts/${envVal('CLOUDFLARE_ACCOUNT_ID')}/storage/kv/namespaces/${envVal('CLOUDFLARE_KV_NAMESPACE_ID')}/values/${encodeURIComponent(key)}`;
}

async function kvGet<T>(key: string): Promise<T | null> {
  try {
    const res = await fetch(kvUrl(key), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${envVal('CLOUDFLARE_API_TOKEN')}`,
      },
    });
    if (!res.ok) return null;
    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text) as T;
  } catch (e) {
    console.warn('kvGet error:', key, (e as Error).message);
    return null;
  }
}

async function kvPut(key: string, value: any): Promise<void> {
  try {
    const res = await fetch(kvUrl(key), {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${envVal('CLOUDFLARE_API_TOKEN')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(value),
    });
    if (!res.ok) {
      const text = await res.text();
      console.warn('kvPut failed:', key, text.slice(0, 200));
    }
  } catch (e) {
    console.warn('kvPut error:', key, (e as Error).message);
  }
}

const sevenDaysAgo = () => Date.now() - 7 * 24 * 60 * 60 * 1000;

function filterActive(all: Blessing[]): Blessing[] {
  const cutoff = sevenDaysAgo();
  return all
    .filter((b) => !b.isHidden && b.createdAt >= cutoff)
    .sort((a, b) => b.createdAt - a.createdAt);
}

function sortAll(all: Blessing[]): Blessing[] {
  return [...all].sort((a, b) => b.createdAt - a.createdAt);
}

export async function getBlessings(): Promise<Blessing[]> {
  if (isCloudflareKVConfigured()) {
    const all = await kvGet<Blessing[]>(KV_KEY);
    if (all) return filterActive(all);
  }
  return filterActive(memoryStore.list);
}

export async function getAllBlessings(): Promise<Blessing[]> {
  if (isCloudflareKVConfigured()) {
    const all = await kvGet<Blessing[]>(KV_KEY);
    if (all) return sortAll(all);
  }
  return sortAll(memoryStore.list);
}

export async function saveBlessing(blessing: Blessing): Promise<Blessing> {
  const now = Date.now();
  const record: Blessing = {
    ...blessing,
    id: blessing.id || String(now),
    createdAt: now,
    isHidden: false,
  };

  if (isCloudflareKVConfigured()) {
    const current = (await kvGet<Blessing[]>(KV_KEY)) || [];
    current.push(record);
    await kvPut(KV_KEY, current);
    return record;
  }

  memoryStore.list.push(record);
  return record;
}

export async function clearScreen(): Promise<void> {
  if (isCloudflareKVConfigured()) {
    const all = (await kvGet<Blessing[]>(KV_KEY)) || [];
    const updated = all.map((b) => (b.isHidden ? b : { ...b, isHidden: true }));
    await kvPut(KV_KEY, updated);
    return;
  }

  memoryStore.list = memoryStore.list.map((b) => (b.isHidden ? b : { ...b, isHidden: true }));
}
