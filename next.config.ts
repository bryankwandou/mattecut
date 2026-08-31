import type { NextConfig } from "next";

/**
 * Content Security Policy.
 *
 * The app has no backend and no third-party scripts, so almost everything
 * can be locked to 'self'. The two exceptions are deliberate:
 *
 * Three relaxations on script-src, each one measured against a real
 * failure rather than guessed at:
 *
 *  - 'unsafe-eval'. The ONNX runtime compiles its Emscripten glue from a
 *    string. 'wasm-unsafe-eval' alone is not enough — with only that, the
 *    first cutout throws EvalError and the product does not work at all.
 *  - blob:. The runtime spawns its worker from a blob URL.
 *  - 'unsafe-inline'. Next's hydration bootstrap and the pre-paint theme
 *    script are inline. A nonce would force every page to render
 *    dynamically, which costs more than it buys here.
 *
 * What those cost is bounded by what this app holds, which is nothing:
 * no accounts, no cookies, no session, no server, no third-party script,
 * and no user data that ever leaves the tab. Everything else stays shut —
 * script and connect are pinned to 'self' plus the single CDN that serves
 * the model, object-src is off, and the page cannot be framed.
 *
 * staticimgly.com is that CDN: the segmentation weights and the WASM
 * runtime come from there.
 *
 * upload.wikimedia.org is the second, and it was added with its cost
 * understood. Self-hosting the backdrop photographs was measured at 348 KB
 * each, so the thousands asked for would have been 1.7 GB — more than a
 * repository or a deployment will carry. The catalogue therefore stores
 * only metadata and loads each picture from Commons when it is chosen.
 *
 * What that host can do here is bounded: images and fetches only, no
 * script, and it never receives a photograph — the cut still happens in
 * this tab, so a backdrop travels in, never out.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https://upload.wikimedia.org",
  "font-src 'self' data:",
  "connect-src 'self' https://staticimgly.com https://upload.wikimedia.org blob: data:",
  "worker-src 'self' blob:",
  "media-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
