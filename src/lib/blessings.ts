import { Blessing } from '@/types/blessing';
import { promises as fs } from 'fs';
import path from 'path';

const LOCAL_FILE = path.join(process.cwd(), 'data', 'blessings.json');

async function readLocal(): Promise<Blessing[]> {
  try {
    const raw = await fs.readFile(LOCAL_FILE, 'utf-8');
    return JSON.parse(raw) as Blessing[];
  } catch {
    return [];
  }
}

async function writeLocal(blessings: Blessing[]): Promise<void> {
  try {
    const dir = path.dirname(LOCAL_FILE);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(LOCAL_FILE, JSON.stringify(blessings, null, 2), 'utf-8');
  } catch (e) {
    console.error('writeLocal error:', e);
  }
}

function isCloudflareKVConfigured(): boolean {
  return Boolean(
    process.env.CLOUDFLARE_API_TOKEN &&
    process.env.CLOUDFLARE_ACCOUNT_ID &&
    process.env.CLOUDFLARE_KV_NAMESPACE_ID
  );
}

const CF_API_BASE = 'https://api.cloudflare.com/client/v4';
const KV_KEY = 'blessing:data';

function kvUrl(key: string): string {
  return `${CF_API_BASE}/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${process.env.CLOUDFLARE_KV_NAMESPACE_ID}/values/${encodeURIComponent(key)}`;
}

async function kvGet<T>(key: string): Promise<T | null> {
  try {
    const res = await fetch(kvUrl(key), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
      },
      next: { revalidate: 0 },
    } as any);
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
        'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(value),
    } as any);
    if (!res.ok) {
      const text = await res.text();
      console.warn('kvPut failed:', key, text.slice(0, 200));
    }
  } catch (e) {
    console.warn('kvPut error:', key, (e as Error).message);
  }
}

const sevenDaysAgo = () => Date.now() - 7 * 24 * 60 * 60 * 1000;

export async function getBlessings(): Promise<Blessing[]> {
  if (isCloudflareKVConfigured()) {
    const all = await kvGet<Blessing[]>(KV_KEY);
    if (all) {
      const cutoff = sevenDaysAgo();
      return all
        .filter((b) => !b.isHidden && b.createdAt >= cutoff)
        .sort((a, b) => b.createdAt - a.createdAt);
    }
  }
  const all = await readLocal();
  const cutoff = sevenDaysAgo();
  return all
    .filter((b) => !b.isHidden && b.createdAt >= cutoff)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function getAllBlessings(): Promise<Blessing[]> {
  if (isCloudflareKVConfigured()) {
    const all = await kvGet<Blessing[]>(KV_KEY);
    if (all) return [...all].sort((a, b) => b.createdAt - a.createdAt);
  }
  const all = await readLocal();
  return all.sort((a, b) => b.createdAt - a.createdAt);
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

  const all = await readLocal();
  all.push(record);
  await writeLocal(all);
  return record;
}

export async function clearScreen(): Promise<void> {
  if (isCloudflareKVConfigured()) {
    const all = (await kvGet<Blessing[]>(KV_KEY)) || [];
    const updated = all.map((b) => (b.isHidden ? b : { ...b, isHidden: true }));
    await kvPut(KV_KEY, updated);
    return;
  }

  const all = await readLocal();
  const updated = all.map((b) => (b.isHidden ? b : { ...b, isHidden: true }));
  await writeLocal(updated);
}
