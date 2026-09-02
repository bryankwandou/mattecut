/**
 * Shoulder coordinates, read rather than inferred.
 *
 * The clothing mask fixed *where* a garment may land. This fixes *how* it
 * sits. Until now the shoulder line was recovered by fitting a line through
 * the top edge of a silhouette — good enough on a synthetic torso, but it
 * depends on the cut-out being clean and on nothing else, a chair or a
 * raised arm, sharing that edge.
 *
 * A pose network answers the question directly. It returns the two shoulder
 * points as numbers, so the width, the centre and the tilt of the garment
 * stop being estimates.
 *
 * Measured from the origin, not quoted:
 *
 *   pose_landmarker_lite.task   5,777,746 B
 *   pose_landmarker_full.task   9,398,198 B
 *   pose_landmarker_heavy.task 30,664,242 B
 *
 * The lite model ships. Finding two shoulders on a portrait is the easiest
 * thing any of the three do, and paying 25 MB more for the heavy one would
 * buy accuracy on limbs this product never looks at.
 *
 * The engine is already here — the same MediaPipe WASM runtime the two
 * lightest tiers use — so this costs weights only.
 */
import type { PoseLandmarker } from "@mediapipe/tasks-vision";
import { fitForModel } from "./fit";
import { LITE } from "./lite";

export const POSE = {
  model: "/mediapipe/pose_landmarker_lite.task",
  bytes: 5_777_746,
} as const;

/** MediaPipe pose indices. 11 and 12 are the shoulders; "left" is the
 *  subject's left, which sits on the viewer's right. */
const LEFT_SHOULDER = 11;
const RIGHT_SHOULDER = 12;

export type Shoulders = {
  /** All fractions of the image. */
  leftX: number;
  leftY: number;
  rightX: number;
  rightY: number;
  /** How sure the network is about the weaker of the two points. */
  score: number;
};

let landmarker: PoseLandmarker | null = null;
let loading: Promise<PoseLandmarker> | null = null;

async function fetchWeights(
  onProgress?: (cur: number, total: number) => void,
): Promise<Uint8Array> {
  const res = await fetch(POSE.model);
  if (!res.ok) throw new Error(`pose ${res.status}`);
  const total = Number(res.headers.get("content-length")) || POSE.bytes;
  if (!res.body) return new Uint8Array(await res.arrayBuffer());

  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let cur = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    cur += value.length;
    onProgress?.(cur, total);
  }
  const out = new Uint8Array(cur);
  let at = 0;
  for (const c of chunks) {
    out.set(c, at);
    at += c.length;
  }
  return out;
}

export function loadPose(
  onProgress?: (cur: number, total: number) => void,
): Promise<PoseLandmarker> {
  if (landmarker) return Promise.resolve(landmarker);
  if (loading) return loading;

  const p = (async () => {
    const vision = await import("@mediapipe/tasks-vision");
    const [files, modelAssetBuffer] = await Promise.all([
      vision.FilesetResolver.forVisionTasks(LITE.wasm),
      fetchWeights(onProgress),
    ]);
    const made = await vision.PoseLandmarker.createFromOptions(files, {
      baseOptions: { modelAssetBuffer },
      runningMode: "IMAGE",
      // One subject. A group photo is not what a jacket is being fitted to,
      // and asking for more costs time on every run.
      numPoses: 1,
      outputSegmentationMasks: false,
    });
    landmarker = made;
    return made;
  })();

  loading = p;
  void p.catch(() => {
    loading = null;
  });
  return p;
}

/**
 * Both shoulders, or null.
 *
 * Null when no person is found, when either shoulder is off the frame, or
 * when the network is not confident — a jacket hung off one badly-placed
 * point is worse than one placed by the clothing box.
 */
export async function findShoulders(
  file: Blob,
  cap: number,
  onProgress?: (cur: number, total: number) => void,
): Promise<Shoulders | null> {
  const pose = await loadPose(onProgress);
  const fitted = await fitForModel(file, cap);
  const bmp = await createImageBitmap(fitted.blob);

  let result;
  try {
    result = pose.detect(bmp);
  } finally {
    bmp.close();
  }

  const people = result?.landmarks;
  if (!people || people.length === 0) return null;

  const marks = people[0];
  const l = marks[LEFT_SHOULDER];
  const r = marks[RIGHT_SHOULDER];
  if (!l || !r) return null;

  // `visibility` is how sure the network is that the point is actually seen
  // rather than inferred from the rest of the body. An inferred shoulder is
  // exactly the guess this file exists to remove.
  const score = Math.min(l.visibility ?? 0, r.visibility ?? 0);
  if (score < 0.5) return null;

  // A shoulder outside the frame has been extrapolated, not observed.
  for (const pt of [l, r]) {
    if (pt.x < -0.02 || pt.x > 1.02 || pt.y < -0.02 || pt.y > 1.02) return null;
  }

  // Two points on top of each other cannot describe a shoulder line, and
  // dividing by that distance later would produce nonsense.
  if (Math.abs(l.x - r.x) < 0.06) return null;

  return {
    leftX: l.x,
    leftY: l.y,
    rightX: r.x,
    rightY: r.y,
    score,
  };
}
