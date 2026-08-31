/// <reference lib="webworker" />

/**
 * The model, run off the main thread.
 *
 * The library has its own `proxyToWorker`, but it is ANDed with a WebGPU
 * check inside the bundle, so on a machine without WebGPU it silently does
 * nothing and inference runs on the main thread — which stops the page
 * answering clicks for the whole cut. Owning the worker means that is no
 * longer conditional on the hardware.
 *
 * Nothing here touches the DOM: the library reaches for `OffscreenCanvas`
 * first and only falls back to `document.createElement` when there is none,
 * and a worker has OffscreenCanvas.
 */
import { preload, removeBackground } from "@imgly/background-removal";
import { fitForModel } from "../src/lib/fit";
import { cutLite, loadLite } from "../src/lib/lite";

type Req = {
  id: number;
  op: "warm" | "cut";
  model: "lite" | "isnet" | "isnet_fp16" | "isnet_quint8";
  device: "cpu" | "gpu";
  file?: Blob;
  /** Longest edge the photo is allowed to keep. The shrink happens here
   *  rather than on the main thread, because decoding a 12 MB photo on the
   *  page is the freeze this worker exists to prevent. */
  cap: number;
};

const ctx = self as unknown as DedicatedWorkerGlobalScope;

ctx.onmessage = async (e: MessageEvent<Req>) => {
  const { id, op, model, device, file, cap } = e.data;

  // The lightest tier runs a different engine on a different model, so it
  // is handled here rather than through the ONNX config below. Running it
  // in the worker matters more than for the others, not less: the machines
  // that pick it are the ones a frozen tab actually ruins.
  if (model === "lite") {
    const report = (cur: number, total: number) =>
      ctx.postMessage({ id, type: "progress", key: "fetch:model", cur, total });
    try {
      if (op === "warm") {
        await loadLite(report);
        ctx.postMessage({ id, type: "done" });
      } else {
        const cut = await cutLite(file as Blob, cap, report);
        ctx.postMessage({ id, type: "done", blob: cut.blob, scaled: cut.scaled });
      }
    } catch (err) {
      ctx.postMessage({ id, type: "error", message: String(err) });
    }
    return;
  }

  const config = {
    model,
    device,
    output: { format: "image/png" as const, quality: 1 },
    progress: (key: string, cur: number, total: number) =>
      ctx.postMessage({ id, type: "progress", key, cur, total }),
  };

  try {
    if (op === "warm") {
      await preload(config);
      ctx.postMessage({ id, type: "done" });
    } else {
      const fitted = await fitForModel(file as Blob, cap);
      const blob = await removeBackground(fitted.blob, config);
      // `scaled` travels back because only the page can act on it: it is
      // what stops the export note promising the original resolution.
      ctx.postMessage({ id, type: "done", blob, scaled: fitted.scaled });
    }
  } catch (err) {
    ctx.postMessage({ id, type: "error", message: String(err) });
  }
};
