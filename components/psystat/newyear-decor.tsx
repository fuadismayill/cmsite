const skyline = [
  [0, 34, 78], [28, 19, 54], [48, 26, 62], [76, 17, 65], [94, 27, 58],
  [126, 22, 61], [150, 24, 52], [177, 17, 61], [201, 24, 55], [228, 22, 65],
]

/** A miniature winter waterfront with three illuminated towers and snow on the roofs. */
export function WinterHarbor({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" className={`ny-only winter-harbor ${className}`} viewBox="0 0 256 104">
      <path fill="currentColor" opacity=".1" d="M0 70Q48 46 95 64T181 64Q221 46 256 58V90H0Z" />
      <circle cx="211" cy="19" r="10" fill="#f8d691" />
      <g fill="currentColor">
        <path d="M62 71Q64 48 80 23Q76 51 84 71ZM84 71Q86 38 105 12Q96 45 106 71ZM107 71Q107 49 123 30Q119 52 127 71Z" />
        {skyline.map(([x,w,y]) => <g key={x}>
          <path d={`M${x} 85V${y}l${w/2} -6 ${w/2} 6v${85-y}Z`} />
          <path d={`M${x} ${y}l${w/2} -6 ${w/2} 6`} fill="none" stroke="#f8e7e7" strokeWidth="2" />
          {[4,10].map(dx => <rect key={dx} x={x+dx} y={y+5} width="3" height="4" rx=".6" fill="#f8d691" />)}
        </g>)}
      </g>
      <path d="M0 84Q47 79 92 84T176 83T256 80V104H0Z" fill="currentColor" opacity=".16" />
      <path d="M16 91h42m13 5h20m58-7h41m14 6h28" stroke="currentColor" opacity=".45" strokeLinecap="round" />
      {[[20,28],[48,12],[141,16],[172,32],[239,9]].map(([x,y],i) =>
        <path key={x} className="winter-star" style={{ animationDelay: `${i * -.7}s` }} d={`M${x} ${y-3}l1 2 3 1-3 1-1 3-1-3-2-1 2-1Z`} fill="currentColor" />)}
    </svg>
  )
}

export function NewYearTree({ className }: { className?: string }) {
  return <WinterHarbor className={className} />
}

export function NewYearHat() {
  return <svg viewBox="0 0 32 24" aria-hidden="true" className="ny-only winter-sprig">
    <path d="M5 21Q15 14 26 2M9 18l-2-8m7 4 1-9m1 7 9-2m-5-3 8-3" fill="none" stroke="#548678" strokeWidth="2.8" strokeLinecap="round" />
    <circle cx="8" cy="18" r="3.6" fill="#b83c62" /><circle cx="14" cy="20" r="2.7" fill="#ce627a" />
  </svg>
}
