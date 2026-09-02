// Turbopack does not bundle `new Worker(new URL('./x.ts', import.meta.url))`:
// it copies the TypeScript through verbatim, so the worker fails to start and
// the model silently falls back onto the main thread — the exact freeze the
// worker exists to prevent. Building it here removes that dependency.
import { build } from "esbuild";
import { cp, mkdir, stat, writeFile } from "node:fs/promises";

await build({
  entryPoints: ["worker/matting.worker.ts"],
  outfile: "public/matting-worker.js",
  bundle: true,
  // A classic worker, not a module one. MediaPipe's runtime loads itself
  // with `importScripts`, which does not exist inside a module worker and
  // fails there as "ModuleFactory not set".
  format: "iife",
  target: "es2022",
  minify: true,
});
console.log("built public/matting-worker.js");

/**
 * MediaPipe, served from our own origin rather than a CDN.
 *
 * Two reasons, and the second is the one that decided it. The page's CSP
 * allows `connect-src 'self'` plus one host, so a CDN would mean widening
 * it for two more origins. And a product whose whole claim is "processed on
 * this device" should not need to call Google to start working. Copying the
 * files costs disk and nothing else.
 *
 * The engine comes from node_modules, so it is pinned to the version in
 * package-lock and needs no network. The weights are fetched once and kept.
 */
const MODELS = {
  // The lightest tier: one figure against everything else, 249 KB.
  "selfie_segmenter.tflite":
    "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite",
  // The tier above it: the same engine, but a network that labels hair as
  // its own class rather than lumping it in with the body. Hair is where
  // every cut-out is judged, which is what makes 16 MB worth offering.
  "selfie_multiclass.tflite":
    "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite",
  // Shoulder coordinates for hanging a jacket. The lite model, because
  // finding two shoulders on a portrait is the easiest thing any of the
  // three do — the heavy one costs 25 MB more for accuracy on limbs this
  // product never looks at.
  "pose_landmarker_lite.task":
    "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task",
};

await mkdir("public/mediapipe", { recursive: true });

// Both the SIMD and the non-SIMD builds: the machines this tier exists for
// are exactly the ones whose browser may not have wasm SIMD.
await cp("node_modules/@mediapipe/tasks-vision/wasm", "public/mediapipe/wasm", {
  recursive: true,
});
console.log("copied public/mediapipe/wasm");

for (const [name, url] of Object.entries(MODELS)) {
  const dest = `public/mediapipe/${name}`;
  const have = await stat(dest).catch(() => null);
  if (have && have.size > 0) {
    console.log(`kept ${dest} (${have.size} bytes)`);
    continue;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${name} ${res.status}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  await writeFile(dest, bytes);
  console.log(`fetched ${dest} (${bytes.length} bytes)`);
}
