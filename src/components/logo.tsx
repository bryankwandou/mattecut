"use client";

import { useId } from "react";

/**
 * Mattecut's mark: a subject caught at the moment it comes free.
 *
 * The name is literal — a matte is the alpha channel that separates a
 * subject from its background, and this app makes one. So the mark shows
 * the operation rather than an abstract glyph. Three ideas, in the order
 * they read:
 *
 *  - The checkerboard is the universal signal for "transparent PNG". It
 *    belongs to this category the way a chat bubble belongs to messaging.
 *  - The bust is what survives the cut.
 *  - The bust is split, and the two halves have been pulled a hair apart.
 *    That gap is the cut itself, and it is the only thing distinguishing
 *    this mark from every other silhouette-in-a-rounded-square.
 *
 * The gap is 1.2 units of 32, which is deliberate: wide enough to survive
 * a 16 px favicon, narrow enough that the silhouette still reads as one
 * person rather than two shapes. That trade-off is the whole design.
 *
 * Every fill comes from a CSS variable, so the mark follows the theme
 * without a second asset.
 */
export function MattecutMark({
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
        <linearGradient id={`${id}-cool`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--accent-lo)" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <rect width="32" height="32" rx="8" />
        </clipPath>
        {/* The left half of the subject, stopping short of centre. */}
        <clipPath id={`${id}-left`}>
          <rect x="0" y="0" width="15.4" height="32" />
        </clipPath>
        {/* The right half, starting after the gap and nudged outward, so the
            two pieces read as having just been parted. */}
        <clipPath id={`${id}-right`}>
          <rect x="16.6" y="0" width="15.4" height="32" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${id}-clip)`}>
        <rect width="32" height="32" fill={`url(#${id}-checker)`} />

        <g clipPath={`url(#${id}-left)`}>
          <circle cx="16" cy="12.5" r="5.1" fill={`url(#${id}-accent)`} />
          <path
            d="M4.6 32c0-6.3 5.1-11.4 11.4-11.4S27.4 25.7 27.4 32H4.6Z"
            fill={`url(#${id}-accent)`}
          />
        </g>

        <g clipPath={`url(#${id}-right)`} transform="translate(1.1 0)">
          <circle cx="16" cy="12.5" r="5.1" fill={`url(#${id}-cool)`} />
          <path
            d="M4.6 32c0-6.3 5.1-11.4 11.4-11.4S27.4 25.7 27.4 32H4.6Z"
            fill={`url(#${id}-cool)`}
          />
        </g>
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

export function MattecutLogo({
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
      <MattecutMark size={size} />
      <span
        className="font-semibold tracking-[-0.03em]"
        style={{ fontSize: size * 0.72 }}
      >
        {/* The two halves of the name carry the two halves of the mark: the
            matte, and the cut that produces it. */}
        Matte<span className="text-accent-text">cut</span>
      </span>
    </span>
  );
}
