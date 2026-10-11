export function PitchLines() {
  const stripes = Array.from({ length: 8 }, (_, i) => i)

  return (
    <>
      {/* Horizontal pitch — desktop / landscape (teams side by side) */}
      <svg
        viewBox="0 0 160 100"
        preserveAspectRatio="none"
        className="absolute inset-0 hidden h-full w-full sm:block"
      >
        <defs>
          <linearGradient id="turf-h" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0f5132" />
            <stop offset="100%" stopColor="#146c43" />
          </linearGradient>
        </defs>
        <rect width={160} height={100} fill="url(#turf-h)" />
        {stripes.map((i) => (
          <rect
            key={i}
            x={i * 20}
            y={0}
            width={20}
            height={100}
            fill={i % 2 === 0 ? 'rgba(255,255,255,0.025)' : 'transparent'}
          />
        ))}
        <g stroke="rgba(255,255,255,0.65)" strokeWidth={0.6} fill="none">
          <rect x={2} y={2} width={156} height={96} />
          <line x1={80} y1={2} x2={80} y2={98} />
          <circle cx={80} cy={50} r={13} />
          <circle cx={80} cy={50} r={0.8} fill="rgba(255,255,255,0.65)" />
          <rect x={2} y={25} width={18} height={50} />
          <rect x={2} y={38} width={7} height={24} />
          <rect x={140} y={25} width={18} height={50} />
          <rect x={151} y={38} width={7} height={24} />
        </g>
      </svg>

      {/* Vertical pitch — mobile / portrait (teams stacked) */}
      <svg
        viewBox="0 0 100 160"
        preserveAspectRatio="none"
        className="absolute inset-0 block h-full w-full sm:hidden"
      >
        <defs>
          <linearGradient id="turf-v" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f5132" />
            <stop offset="100%" stopColor="#146c43" />
          </linearGradient>
        </defs>
        <rect width={100} height={160} fill="url(#turf-v)" />
        {stripes.map((i) => (
          <rect
            key={i}
            x={0}
            y={i * 20}
            width={100}
            height={20}
            fill={i % 2 === 0 ? 'rgba(255,255,255,0.025)' : 'transparent'}
          />
        ))}
        <g stroke="rgba(255,255,255,0.65)" strokeWidth={0.6} fill="none">
          <rect x={2} y={2} width={96} height={156} />
          <line x1={2} y1={80} x2={98} y2={80} />
          <circle cx={50} cy={80} r={13} />
          <circle cx={50} cy={80} r={0.8} fill="rgba(255,255,255,0.65)" />
          <rect x={16} y={2} width={68} height={18} />
          <rect x={38} y={2} width={24} height={7} />
          <rect x={16} y={140} width={68} height={18} />
          <rect x={38} y={151} width={24} height={7} />
        </g>
      </svg>
    </>
  )
}
