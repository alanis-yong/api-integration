interface ItemImageProps {
  id: number
  name: string
}

const PALETTES = [
  ['#667eea', '#764ba2'],
  ['#f093fb', '#f5576c'],
  ['#4facfe', '#00f2fe'],
  ['#43e97b', '#38f9d7'],
  ['#fa709a', '#fee140'],
  ['#a18cd1', '#fbc2eb'],
  ['#fccb90', '#d57eeb'],
  ['#e0c3fc', '#8ec5fc'],
  ['#f6d365', '#fda085'],
  ['#96fbc4', '#f9f586'],
]

export function ItemImage({ id, name }: ItemImageProps) {
  const palette = PALETTES[id % PALETTES.length]
  const gradientId = `grad-${id}`
  const letter = name.charAt(0).toUpperCase()

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      width="100%"
      height="100%"
      aria-label={name}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={palette[0]} />
          <stop offset="100%" stopColor={palette[1]} />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill={`url(#${gradientId})`} />
      <circle cx="100" cy="85" r="38" fill="rgba(255,255,255,0.15)" />
      <text
        x="100"
        y="105"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="system-ui, sans-serif"
        fontWeight="700"
        fontSize="52"
        fill="rgba(255,255,255,0.9)"
      >
        {letter}
      </text>
      <rect x="30" y="148" width="140" height="6" rx="3" fill="rgba(255,255,255,0.25)" />
      <rect x="55" y="162" width="90" height="6" rx="3" fill="rgba(255,255,255,0.15)" />
    </svg>
  )
}
