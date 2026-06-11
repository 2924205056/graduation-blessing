import { ref, get, set, push, query, orderByChild, startAt } from 'firebase/database';
import { db } from './firebase';
import { Blessing } from '@/types/blessing';
import { promises as fs } from 'fs';
import path from 'path';

const BLESSINGS_REF = 'blessings';
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

function isFirebaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
}

const sevenDaysAgo = () => Date.now() - 7 * 24 * 60 * 60 * 1000;

export async function getBlessings(): Promise<Blessing[]> {
  if (isFirebaseConfigured()) {
    try {
      const cutoff = sevenDaysAgo();
      const q = query(
        ref(db, BLESSINGS_REF),
        orderByChild('createdAt'),
        startAt(cutoff)
      );
      const snapshot = await get(q);
      const blessings: Blessing[] = [];
      snapshot.forEach((child) => {
        const data = child.val();
        if (!data.isHidden) {
          blessings.push({ ...data, id: child.key! });
        }
      });
      if (blessings.length > 0) return blessings.reverse();
    } catch (e) {
      console.warn('Firebase getBlessings failed, falling back to local:', (e as Error).message);
    }
  }
  const all = await readLocal();
  const cutoff = sevenDaysAgo();
  return all
    .filter((b) => !b.isHidden && b.createdAt >= cutoff)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function getAllBlessings(): Promise<Blessing[]> {
  if (isFirebaseConfigured()) {
    try {
      const snapshot = await get(ref(db, BLESSINGS_REF));
      const blessings: Blessing[] = [];
      snapshot.forEach((child) => {
        blessings.push({ ...child.val(), id: child.key! });
      });
      if (blessings.length > 0) return blessings.reverse();
    } catch (e) {
      console.warn('Firebase getAllBlessings failed, falling back to local:', (e as Error).message);
    }
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

  if (isFirebaseConfigured()) {
    try {
      const newRef = push(ref(db, BLESSINGS_REF));
      await set(newRef, {
        name: record.name,
        message: record.message,
        imageUrl: record.imageUrl || null,
        sticker: record.sticker || null,
        gownColor: record.gownColor || 'red',
        isHidden: false,
        createdAt: now,
      });
      record.id = newRef.key!;
      return record;
    } catch (e) {
      console.warn('Firebase saveBlessing failed, falling back to local:', (e as Error).message);
    }
  }

  const all = await readLocal();
  all.push(record);
  await writeLocal(all);
  return record;
}

export async function clearScreen(): Promise<void> {
  if (isFirebaseConfigured()) {
    try {
      const snapshot = await get(ref(db, BLESSINGS_REF));
      const updates: Record<string, any> = {};
      snapshot.forEach((child) => {
        if (!child.val().isHidden) {
          updates[`${BLESSINGS_REF}/${child.key}/isHidden`] = true;
        }
      });
      if (Object.keys(updates).length > 0) {
        await set(ref(db), updates);
      }
      return;
    } catch (e) {
      console.warn('Firebase clearScreen failed, falling back to local:', (e as Error).message);
    }
  }

  const all = await readLocal();
  const updated = all.map((b) => (b.isHidden ? b : { ...b, isHidden: true }));
  await writeLocal(updated);
}
