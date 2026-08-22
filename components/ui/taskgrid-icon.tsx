"use client";

import { useId, type SVGProps } from "react";

/**
 * The Taskgrid mark — the same artwork as `app/icon.svg` and the native app
 * icons, inlined so it paints with the first frame instead of waiting on a
 * request. Keep it in sync with `public/brand/taskgrid-mark.svg`.
 *
 * A client component only because the clip paths need `useId`: the mark is
 * rendered more than once on a page, and fixed ids would collide.
 */
export function TaskgridIcon(props: SVGProps<SVGSVGElement>) {
  // Stripped to alphanumerics so the value is a valid id in every React major.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");

  return (
    <svg viewBox="0 0 512 512" aria-hidden {...props}>
      <defs>
        <clipPath id={`${uid}-ring`}>
          <circle cx="244.5" cy="255.5" r="245" />
          <rect x="244.5" y="0" width="268" height="512" />
        </clipPath>
        <clipPath id={`${uid}-card-a`}>
          <rect x="235.5" y="20.5" width="276" height="137" rx="11" />
        </clipPath>
        <clipPath id={`${uid}-box-a`}>
          <rect x="103.5" y="20.5" width="139" height="137" rx="13" />
        </clipPath>
        <clipPath id={`${uid}-in-a`}>
          <rect x="129.5" y="46.5" width="87" height="85" rx="5" />
        </clipPath>
        <clipPath id={`${uid}-card-b`}>
          <rect x="172.5" y="187.5" width="275" height="136" rx="11" />
        </clipPath>
        <clipPath id={`${uid}-box-b`}>
          <rect x="39.5" y="187.5" width="140" height="136" rx="13" />
        </clipPath>
        <clipPath id={`${uid}-in-b`}>
          <rect x="65.5" y="213.5" width="88" height="84" rx="5" />
        </clipPath>
        <clipPath id={`${uid}-card-c`}>
          <rect x="107.5" y="353.5" width="277" height="137" rx="11" />
        </clipPath>
        <clipPath id={`${uid}-box-c`}>
          <rect x="-23.5" y="353.5" width="140" height="137" rx="13" />
        </clipPath>
      </defs>
      <circle cx="244.5" cy="255.5" r="245" fill="#4070ea" />
      <rect x="235.5" y="20.5" width="276" height="137" rx="11" fill="#e6fcff" />
      <rect x="235.5" y="20.5" width="62" height="137" fill="#ccebff" clipPath={`url(#${uid}-card-a)`} />
      <rect x="267.5" y="66.5" width="217" height="16" rx="8" fill="#b8dff4" />
      <rect x="267.5" y="101.5" width="149" height="16" rx="8" fill="#b8dff4" />
      <rect x="103.5" y="20.5" width="139" height="137" rx="13" fill="#ffe600" />
      <g clipPath={`url(#${uid}-box-a)`}>
        <rect x="103.5" y="20.5" width="64" height="137" fill="#f9ce00" />
        <rect x="129.5" y="46.5" width="87" height="85" rx="5" fill="#f9ce00" />
        <rect x="129.5" y="46.5" width="40" height="85" fill="#f4b500" clipPath={`url(#${uid}-in-a)`} />
      </g>
      <path d="M156.5 88.5L167 99.5L189.5 78.5" fill="none" stroke="#e6fcff" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="172.5" y="187.5" width="275" height="136" rx="11" fill="#e6fcff" />
      <rect x="172.5" y="187.5" width="62" height="136" fill="#ccebff" clipPath={`url(#${uid}-card-b)`} />
      <rect x="204.5" y="233.5" width="192" height="16" rx="8" fill="#b8dff4" />
      <rect x="204.5" y="268.5" width="150" height="16" rx="8" fill="#b8dff4" />
      <rect x="39.5" y="187.5" width="140" height="136" rx="13" fill="#a5c013" />
      <g clipPath={`url(#${uid}-box-b)`}>
        <rect x="39.5" y="187.5" width="64" height="136" fill="#8dae16" />
        <rect x="65.5" y="213.5" width="88" height="84" rx="5" fill="#8dae16" />
        <rect x="65.5" y="213.5" width="40" height="84" fill="#749c18" clipPath={`url(#${uid}-in-b)`} />
      </g>
      <path d="M93 255L103.5 266L126 245" fill="none" stroke="#e6fcff" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <g clipPath={`url(#${uid}-ring)`}>
        <rect x="107.5" y="353.5" width="277" height="137" rx="11" fill="#e6fcff" />
        <rect x="107.5" y="353.5" width="62" height="137" fill="#ccebff" clipPath={`url(#${uid}-card-c)`} />
        <rect x="139.5" y="399.5" width="180" height="16" rx="8" fill="#b8dff4" />
        <rect x="139.5" y="434.5" width="149" height="16" rx="8" fill="#b8dff4" />
        <rect x="-23.5" y="353.5" width="140" height="137" rx="13" fill="#fe4675" />
        <g clipPath={`url(#${uid}-box-c)`}>
          <rect x="2.5" y="379.5" width="88" height="85" rx="5" fill="#ec3969" />
        </g>
      </g>
    </svg>
  );
}
