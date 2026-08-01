/**
 * Inline SVG illustrations — no network requests, theme-consistent, and they
 * scale cleanly at any size.
 */

export function EmptyGroupsIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 200"
      fill="none"
      className={className ?? "h-44 w-auto"}
      aria-hidden
    >
      <defs>
        <linearGradient id="eg-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#eef0ff" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
        <linearGradient id="eg-b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8079fb" />
          <stop offset="100%" stopColor="#4f39f6" />
        </linearGradient>
      </defs>

      <ellipse cx="160" cy="176" rx="118" ry="14" fill="#eef0ff" />

      <rect
        x="72"
        y="44"
        width="176"
        height="112"
        rx="14"
        fill="url(#eg-a)"
        stroke="#d5d8e2"
      />
      <rect x="72" y="44" width="176" height="26" rx="14" fill="#f6f7f9" />
      <rect x="72" y="58" width="176" height="12" fill="#f6f7f9" />
      <circle cx="88" cy="57" r="3.5" fill="#c6cbff" />
      <circle cx="100" cy="57" r="3.5" fill="#e6e8ee" />
      <circle cx="112" cy="57" r="3.5" fill="#e6e8ee" />

      <rect x="88" y="86" width="60" height="7" rx="3.5" fill="#c6cbff" />
      <rect x="88" y="102" width="102" height="6" rx="3" fill="#e6e8ee" />
      <rect x="88" y="116" width="78" height="6" rx="3" fill="#e6e8ee" />
      <rect x="88" y="130" width="90" height="6" rx="3" fill="#e6e8ee" />

      <g>
        <circle cx="232" cy="52" r="26" fill="url(#eg-b)" />
        <path
          d="M232 42v20M222 52h20"
          stroke="#fff"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
      </g>

      <circle cx="66" cy="112" r="15" fill="#fff" stroke="#d5d8e2" />
      <circle cx="66" cy="107" r="5" fill="#c6cbff" />
      <path
        d="M57 120c1.6-5 4.9-7.4 9-7.4s7.4 2.4 9 7.4"
        fill="#c6cbff"
      />

      <circle cx="256" cy="126" r="15" fill="#fff" stroke="#d5d8e2" />
      <circle cx="256" cy="121" r="5" fill="#a3a8ff" />
      <path d="M247 134c1.6-5 4.9-7.4 9-7.4s7.4 2.4 9 7.4" fill="#a3a8ff" />

      <circle cx="42" cy="60" r="5" fill="#c6cbff" />
      <circle cx="284" cy="92" r="4" fill="#a3a8ff" />
      <circle cx="52" cy="152" r="3.5" fill="#e0e3ff" />
    </svg>
  );
}

export function EmptyTasksIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 160"
      fill="none"
      className={className ?? "h-32 w-auto"}
      aria-hidden
    >
      <ellipse cx="120" cy="142" rx="82" ry="10" fill="#eef0ff" />
      <rect
        x="62"
        y="26"
        width="116"
        height="102"
        rx="12"
        fill="#fff"
        stroke="#d5d8e2"
      />
      <rect x="80" y="48" width="46" height="6" rx="3" fill="#c6cbff" />
      <rect x="80" y="66" width="80" height="5" rx="2.5" fill="#e6e8ee" />
      <rect x="80" y="80" width="62" height="5" rx="2.5" fill="#e6e8ee" />
      <rect x="80" y="94" width="72" height="5" rx="2.5" fill="#e6e8ee" />
      <circle cx="164" cy="34" r="16" fill="#4f39f6" />
      <path
        d="m158 34 4.4 4.6 8-8.6"
        stroke="#fff"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function EmptyInboxIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 140"
      fill="none"
      className={className ?? "h-28 w-auto"}
      aria-hidden
    >
      <ellipse cx="100" cy="124" rx="66" ry="9" fill="#eef0ff" />
      <path
        d="M46 56h108v46a10 10 0 0 1-10 10H56a10 10 0 0 1-10-10V56Z"
        fill="#fff"
        stroke="#d5d8e2"
      />
      <path
        d="M46 56 100 26l54 30-54 30-54-30Z"
        fill="#f6f7f9"
        stroke="#d5d8e2"
        strokeLinejoin="round"
      />
      <circle cx="100" cy="56" r="12" fill="#e0e3ff" />
      <path
        d="M100 50v7m0 5h.01"
        stroke="#4f39f6"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function HeroPreview({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 360"
      fill="none"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="hp-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#eef0ff" />
          <stop offset="100%" stopColor="#f6f7f9" />
        </linearGradient>
        <linearGradient id="hp-accent" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6650f2" />
          <stop offset="100%" stopColor="#8079fb" />
        </linearGradient>
      </defs>

      <rect width="520" height="360" rx="20" fill="url(#hp-bg)" />

      {/* app frame */}
      <rect
        x="28"
        y="30"
        width="464"
        height="300"
        rx="14"
        fill="#fff"
        stroke="#e6e8ee"
      />
      <rect x="28" y="30" width="464" height="38" rx="14" fill="#fafbfc" />
      <rect x="28" y="54" width="464" height="14" fill="#fafbfc" />
      <line x1="28" y1="68" x2="492" y2="68" stroke="#e6e8ee" />
      <circle cx="46" cy="49" r="4" fill="#c6cbff" />
      <circle cx="60" cy="49" r="4" fill="#e6e8ee" />
      <circle cx="74" cy="49" r="4" fill="#e6e8ee" />
      <rect x="200" y="42" width="120" height="14" rx="7" fill="#eef0ff" />

      {/* sidebar */}
      <line x1="140" y1="68" x2="140" y2="330" stroke="#e6e8ee" />
      <rect x="48" y="86" width="76" height="26" rx="8" fill="#4f39f6" />
      <rect x="56" y="96" width="46" height="6" rx="3" fill="#fff" opacity="0.9" />
      <rect x="56" y="128" width="56" height="6" rx="3" fill="#e6e8ee" />
      <rect x="56" y="152" width="44" height="6" rx="3" fill="#e6e8ee" />
      <rect x="56" y="176" width="52" height="6" rx="3" fill="#e6e8ee" />
      <rect x="48" y="286" width="76" height="26" rx="8" fill="#eef0ff" />

      {/* stat row */}
      <rect x="160" y="86" width="98" height="58" rx="10" fill="url(#hp-accent)" />
      <rect x="172" y="102" width="40" height="6" rx="3" fill="#fff" opacity="0.7" />
      <rect x="172" y="116" width="58" height="12" rx="6" fill="#fff" opacity="0.95" />

      <rect
        x="270"
        y="86"
        width="98"
        height="58"
        rx="10"
        fill="#fff"
        stroke="#e6e8ee"
      />
      <rect x="282" y="102" width="40" height="6" rx="3" fill="#e6e8ee" />
      <rect x="282" y="116" width="52" height="12" rx="6" fill="#c6cbff" />

      <rect
        x="380"
        y="86"
        width="92"
        height="58"
        rx="10"
        fill="#fff"
        stroke="#e6e8ee"
      />
      <rect x="392" y="102" width="36" height="6" rx="3" fill="#e6e8ee" />
      <rect x="392" y="116" width="46" height="12" rx="6" fill="#c6cbff" />

      {/* task rows */}
      {[0, 1, 2, 3].map((row) => (
        <g key={row} transform={`translate(0 ${row * 42})`}>
          <rect
            x="160"
            y="162"
            width="312"
            height="34"
            rx="9"
            fill="#fff"
            stroke="#e6e8ee"
          />
          <circle cx="178" cy="179" r="6" fill={row === 0 ? "#4f39f6" : "#e0e3ff"} />
          <rect
            x="194"
            y="175"
            width={row === 1 ? 130 : row === 2 ? 96 : 150}
            height="7"
            rx="3.5"
            fill="#e6e8ee"
          />
          <rect x="392" y="172" width="30" height="13" rx="6.5" fill="#eef0ff" />
          <circle cx="446" cy="179" r="8" fill="#f6f7f9" stroke="#e6e8ee" />
        </g>
      ))}
    </svg>
  );
}
