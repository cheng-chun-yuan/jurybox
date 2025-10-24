interface LogoProps {
  className?: string
  size?: number
}

export function Logo({ className = '', size = 32 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Top row */}
      <rect x="8" y="0" width="4" height="4" fill="#C3FF00" />
      <rect x="12" y="0" width="4" height="4" fill="#C3FF00" />
      <rect x="16" y="0" width="4" height="4" fill="#C3FF00" />

      {/* Second row */}
      <rect x="4" y="4" width="4" height="4" fill="#C3FF00" />
      <rect x="20" y="4" width="4" height="4" fill="#C3FF00" />

      {/* Third row */}
      <rect x="0" y="8" width="4" height="4" fill="#C3FF00" />
      <rect x="24" y="8" width="4" height="4" fill="#C3FF00" />

      {/* Fourth row */}
      <rect x="0" y="12" width="4" height="4" fill="#C3FF00" />
      <rect x="24" y="12" width="4" height="4" fill="#C3FF00" />

      {/* Fifth row - center */}
      <rect x="0" y="16" width="4" height="4" fill="#C3FF00" />
      <rect x="12" y="16" width="4" height="4" fill="#C3FF00" />
      <rect x="16" y="16" width="4" height="4" fill="#C3FF00" />
      <rect x="24" y="16" width="4" height="4" fill="#C3FF00" />

      {/* Sixth row */}
      <rect x="0" y="20" width="4" height="4" fill="#C3FF00" />
      <rect x="24" y="20" width="4" height="4" fill="#C3FF00" />

      {/* Seventh row */}
      <rect x="4" y="24" width="4" height="4" fill="#C3FF00" />
      <rect x="20" y="24" width="4" height="4" fill="#C3FF00" />

      {/* Bottom row */}
      <rect x="8" y="28" width="4" height="4" fill="#C3FF00" />
      <rect x="12" y="28" width="4" height="4" fill="#C3FF00" />
      <rect x="16" y="28" width="4" height="4" fill="#C3FF00" />
    </svg>
  )
}
