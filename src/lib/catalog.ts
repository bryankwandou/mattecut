/**
 * An audit of what this product can actually download.
 *
 * The quality tiers name three models and three sizes. Those numbers were
 * once written by hand, which makes them a claim rather than a fact — and
 * the obvious question about any such list is what got left off it. So
 * nothing here is hardcoded: the sizes and the count are read from the same
 * manifest the matting library itself fetches, at the moment the reader
 * asks. If the answer is inconvenient, it still shows the real answer.
 */

const PACKAGE_VERSION = "1.7.0";
const BASE = `https://staticimgly.com/@imgly/background-removal-data/${PACKAGE_VERSION}/dist`;

export type Entry = {
  /** Path as the manifest names it, e.g. "/models/isnet_fp16". */
  key: string;
  bytes: number;
  /** How many pieces it arrives in. The library fetches 4 MB at a time. */
  chunks: number;
  /** Weights, the runtime that executes them, or the code that loads it. */
  role: "model" | "runtime" | "loader";
};

export type Catalog = {
  entries: Entry[];
  /** The smallest and largest weight files on offer, in bytes. */
  smallest: number;
  largest: number;
  models: number;
  /** The CPU runtime that executes the weights. A tier's advertised size is
   *  its model plus this, which is why the two numbers differ on screen. */
  runtime: number;
};

type Chunk = { offsets: [number, number] };
type Manifest = Record<string, { chunks?: Chunk[] }>;

function role(key: string): Entry["role"] {
  if (key.startsWith("/models/")) return "model";
  return key.endsWith(".wasm") ? "runtime" : "loader";
}

/** Reads the live manifest. Throws on a bad response so the caller can say
 *  the check failed, rather than quietly showing numbers I wrote. */
export async function readCatalog(signal?: AbortSignal): Promise<Catalog> {
  const res = await fetch(`${BASE}/resources.json`, { signal });
  if (!res.ok) throw new Error(`manifest ${res.status}`);
  const raw: Manifest = await res.json();

  const entries: Entry[] = Object.entries(raw)
    .map(([key, v]) => {
      const chunks = v.chunks ?? [];
      // A chunk carries its byte range, so the end of the last one is the
      // file size — no separate length field to trust.
      const bytes = chunks.reduce((n, c) => Math.max(n, c.offsets[1]), 0);
      return { key, bytes, chunks: chunks.length, role: role(key) };
    })
    .sort((a, b) => b.bytes - a.bytes);

  const weights = entries.filter((e) => e.role === "model").map((e) => e.bytes);
  if (weights.length === 0) throw new Error("no models in manifest");

  const cpu = entries.find(
    (e) => e.key === "/onnxruntime-web/ort-wasm-simd-threaded.wasm",
  );

  return {
    entries,
    runtime: cpu?.bytes ?? 0,
    smallest: Math.min(...weights),
    largest: Math.max(...weights),
    models: weights.length,
  };
}

export function mb(bytes: number) {
  return bytes / 1_048_576;
}
