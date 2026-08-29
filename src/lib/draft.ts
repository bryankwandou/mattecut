/**
 * A crash-safe copy of the work in progress.
 *
 * The cut result is a Blob and the source photo is up to 12 MB, so
 * localStorage is the wrong tool twice over: it stores strings only, and
 * its quota is around 5 MB. IndexedDB stores Blobs natively and has room.
 *
 * Everything here fails silently. A draft is a convenience; a browser that
 * refuses storage (private mode, blocked site data) must still get a fully
 * working studio, just without the safety net.
 */

const DB_NAME = "roto";
const STORE = "draft";
const KEY = "current";

/** Drafts older than this are stale enough that restoring one would
 *  surprise the reader more than help them. */
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

const TIERS = ["light", "balanced", "maximum"] as const;

export type Draft = {
  name: string;
  type: string;
  original: Blob;
  master: Blob;
  quality: "light" | "balanced" | "maximum";
  bg: unknown;
  /** Optional so a draft written before jackets existed still loads. */
  attire?: string | null;
  attireScale?: number;
  attireDrop?: number;
  at: number;
};

function open(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    let req: IDBOpenDBRequest;
    try {
      req = indexedDB.open(DB_NAME, 1);
    } catch {
      resolve(null);
      return;
    }
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
    // Another tab holding an old version open would otherwise hang this
    // promise forever, and with it the studio's first paint.
    req.onblocked = () => resolve(null);
  });
}

function tx(
  db: IDBDatabase,
  mode: IDBTransactionMode,
  run: (s: IDBObjectStore) => IDBRequest,
): Promise<unknown> {
  return new Promise((resolve) => {
    try {
      const t = db.transaction(STORE, mode);
      const req = run(t.objectStore(STORE));
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      t.onabort = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function saveDraft(d: Draft): Promise<void> {
  const db = await open();
  if (!db) return;
  await tx(db, "readwrite", (s) => s.put(d, KEY));
  db.close();
}

export async function loadDraft(): Promise<Draft | null> {
  const db = await open();
  if (!db) return null;
  const raw = (await tx(db, "readonly", (s) => s.get(KEY))) as Draft | null;
  db.close();
  if (!raw || typeof raw.at !== "number") return null;
  if (Date.now() - raw.at > MAX_AGE_MS) {
    void clearDraft();
    return null;
  }
  // A half-written record from a crash mid-put is worse than none.
  if (!(raw.original instanceof Blob) || !(raw.master instanceof Blob)) {
    void clearDraft();
    return null;
  }
  // A draft written by an older build can name a tier this one no longer
  // has. Restoring it would hand the matting library `undefined` for a
  // model the moment the reader pressed anything, so the draft goes
  // instead — one lost result beats a studio that throws on first use.
  if (!TIERS.includes(raw.quality)) {
    void clearDraft();
    return null;
  }
  return raw;
}

export async function clearDraft(): Promise<void> {
  const db = await open();
  if (!db) return;
  await tx(db, "readwrite", (s) => s.delete(KEY));
  db.close();
}
