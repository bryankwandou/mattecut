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

type Req = {
  id: number;
  op: "warm" | "cut";
  model: "isnet" | "isnet_fp16" | "isnet_quint8";
  device: "cpu" | "gpu";
  file?: Blob;
};

const ctx = self as unknown as DedicatedWorkerGlobalScope;

ctx.onmessage = async (e: MessageEvent<Req>) => {
  const { id, op, model, device, file } = e.data;

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
      const blob = await removeBackground(file as Blob, config);
      ctx.postMessage({ id, type: "done", blob });
    }
  } catch (err) {
    ctx.postMessage({ id, type: "error", message: String(err) });
  }
};
