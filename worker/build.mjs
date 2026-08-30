// Turbopack does not bundle `new Worker(new URL('./x.ts', import.meta.url))`:
// it copies the TypeScript through verbatim, so the worker fails to start and
// the model silently falls back onto the main thread — the exact freeze the
// worker exists to prevent. Building it here removes that dependency.
import { build } from "esbuild";

await build({
  entryPoints: ["worker/matting.worker.ts"],
  outfile: "public/matting-worker.js",
  bundle: true,
  format: "esm",
  target: "es2022",
  minify: true,
});
console.log("built public/matting-worker.js");
