"use client";

import { useId } from "react";

/**
 * Roto's mark: a subject silhouette lifted off an alpha checkerboard.
 *
 * The checkerboard is the universal signal for "transparent PNG", so it
 * belongs to this category the way a chat bubble belongs to messaging.
 * The bust is the subject that survived the cut. At 16px it still reads
 * as two shapes, which is the whole test.
 *
 * Every fill comes from a CSS variable, so the mark follows the theme
 * without a second asset.
 */
export function RotoMark({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  // Two marks on one page must not share gradient ids, or the second one
  // silently inherits the first one's defs.
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <pattern
          id={`${id}-checker`}
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
        >
          <rect width="8" height="8" fill="var(--mark-a)" />
          <rect width="4" height="4" fill="var(--mark-b)" />
          <rect x="4" y="4" width="4" height="4" fill="var(--mark-b)" />
        </pattern>
        <linearGradient id={`${id}-accent`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--accent-hi)" />
          <stop offset="100%" stopColor="var(--accent)" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <rect width="32" height="32" rx="8" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${id}-clip)`}>
        <rect width="32" height="32" fill={`url(#${id}-checker)`} />
        {/* The lifted subject: head + shoulders, the shape every cutout makes. */}
        <circle cx="16" cy="12.5" r="5.1" fill={`url(#${id}-accent)`} />
        <path
          d="M4.6 32c0-6.3 5.1-11.4 11.4-11.4S27.4 25.7 27.4 32H4.6Z"
          fill={`url(#${id}-accent)`}
        />
      </g>
      <rect
        width="32"
        height="32"
        rx="8"
        stroke="var(--mark-edge)"
        strokeWidth="1"
      />
    </svg>
  );
}

export function RotoLogo({
  size = 28,
  className = "inline-flex",
}: {
  size?: number;
  className?: string;
}) {
  return (
    // Display belongs to the caller, so a responsive `hidden` never has to
    // fight a base display utility for precedence.
    <span className={`items-center gap-2.5 ${className}`}>
      <RotoMark size={size} />
      <span
        className="font-semibold tracking-[-0.03em]"
        style={{ fontSize: size * 0.72 }}
      >
        Roto
      </span>
    </span>
  );
}
