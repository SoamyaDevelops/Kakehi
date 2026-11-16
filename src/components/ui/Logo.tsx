/** Kakehi mark: a bamboo water pipe, tilted. `animate` plays the one-time tip on load. */
export function LogoMark({ size = 28, animate = false }: { size?: number; animate?: boolean }) {
  return (
    <svg
      className={animate ? 'logo-mark logo-tip' : 'logo-mark'}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="32" height="32" rx="7" fill="var(--accent)" />
      <g className="logo-tube">
        <rect x="5" y="12.5" width="22" height="7" rx="3.5" fill="#f5f5f3" />
        <rect x="5" y="12.5" width="7" height="7" rx="3.5" fill="#171817" opacity="0.18" />
      </g>
    </svg>
  )
}

export function Wordmark() {
  return (
    <span className="wordmark">
      <LogoMark />
      <span>Kakehi</span>
    </span>
  )
}
