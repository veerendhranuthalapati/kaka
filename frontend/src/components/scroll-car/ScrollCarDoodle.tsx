export function ScrollCarDoodle() {
  return (
    <svg
      width="14"
      height="26"
      viewBox="0 0 24 40"
      className="block overflow-visible"
      aria-hidden="true"
    >
      <g>
        <ellipse cx="12" cy="20" rx="9" ry="14" fill="rgb(var(--accent))" opacity="0.95" />
        <path
          d="M6 14 Q12 10 18 14 L17 18 Q12 16 7 18 Z"
          fill="rgb(8 10 14)"
          opacity="0.55"
        />
        <rect x="5" y="11" width="3" height="2" rx="0.5" fill="rgb(251 191 36)" />
        <rect x="16" y="11" width="3" height="2" rx="0.5" fill="rgb(251 191 36)" />
        <rect x="4" y="17" width="4" height="3" rx="0.6" fill="rgb(8 10 14)" />
        <rect x="16" y="17" width="4" height="3" rx="0.6" fill="rgb(8 10 14)" />
        <rect x="4" y="27" width="4" height="2" rx="0.4" fill="rgb(248 113 113)" className="scroll-car-tail" />
        <rect x="16" y="27" width="4" height="2" rx="0.4" fill="rgb(248 113 113)" className="scroll-car-tail" />
        <path
          d="M5 8 Q12 4 19 8 Q20 20 19 32 Q12 36 5 32 Q4 20 5 8"
          fill="none"
          stroke="rgb(245 246 250)"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

export function FinishFlagDoodle() {
  return (
    <svg width="12" height="14" viewBox="0 0 12 14" aria-hidden="true">
      <line x1="2" y1="1" x2="2" y2="13" stroke="rgb(245 246 250)" strokeWidth="1.2" />
      <path d="M2 2 L10 4 L2 6 Z" fill="rgb(var(--accent))" stroke="rgb(245 246 250)" strokeWidth="0.6" />
    </svg>
  );
}
