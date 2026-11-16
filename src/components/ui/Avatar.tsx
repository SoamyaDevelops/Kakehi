const HUES = ['#d96c43', '#5f8a6e', '#7a8a9e', '#b08a4a', '#8a6f7a', '#6f8f8a']

function pick(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return HUES[h % HUES.length]
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

export function Avatar({ name, seed, size = 32 }: { name: string; seed?: string; size?: number }) {
  return (
    <span
      className="avatar"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4), background: pick(seed ?? name) }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  )
}
