function AppLogo() {
  return (
    <svg 
      width="40" 
      height="40" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className="app-logo"
    >
      {/* Card - Background / Bottom Right / Lowered */}
      <rect x="14" y="17" width="8" height="6" rx="1.5" ry="1.5" />
      
      {/* Clock - Foreground / Center Left */}
      {/* Fill with header background color to create the 'cutout' over the card area */}
      <circle cx="7.5" cy="14" r="6" fill="#0f172a" />
      <circle cx="7.5" cy="14" r="6" />
      <polyline points="7.5 11 7.5 14 9.5 14" />

      {/* Contactless Arcs - Concentric with the clock center (7.5, 14) */}
      {/* Bigger and completely separate from the card */}
      
      {/* Inner arc: R=10 */}
      <path d="M 11 4.5 a 10 10 0 0 1 6.5 6.5" />
      
      {/* Outer arc: R=14 */}
      <path d="M 12 1 a 14 14 0 0 1 9.5 10" opacity="0.8" />
    </svg>
  )
}

export default AppLogo
