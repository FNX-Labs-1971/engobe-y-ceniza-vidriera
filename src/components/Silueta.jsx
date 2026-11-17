// Siluetas simples de cada pieza (viewBox 120×120). Usan currentColor.

const trazo = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round' }
const pozo = { opacity: 0.22, fill: '#3A3531' }

const FORMAS = {
  'taza-desayuno': (
    <>
      <path d="M30 42h50v30a20 20 0 0 1-20 20H50a20 20 0 0 1-20-20z" />
      <path d="M80 50a11 11 0 0 1 0 22" {...trazo} strokeWidth="6" />
      <rect x="38" y="92" width="34" height="4" rx="2" />
    </>
  ),
  'cuenco-hondo': (
    <>
      <path d="M20 48H100A40 40 0 0 1 20 48Z" />
      <rect x="46" y="86" width="28" height="6" rx="2" />
    </>
  ),
  'plato-playo': (
    <>
      <ellipse cx="60" cy="64" rx="48" ry="14" />
      <ellipse cx="60" cy="62" rx="30" ry="7" {...pozo} />
    </>
  ),
  'plato-hondo': (
    <>
      <path d="M18 54Q22 78 60 80Q98 78 102 54Z" />
      <ellipse cx="60" cy="54" rx="42" ry="10" />
      <ellipse cx="60" cy="55" rx="28" ry="6" {...pozo} />
    </>
  ),
  'maceta-colgante': (
    <>
      <path d="M60 14L36 56M60 14v42M60 14l24 42" {...trazo} strokeWidth="1.6" />
      <circle cx="60" cy="13" r="3" />
      <rect x="30" y="54" width="60" height="9" rx="2" />
      <path d="M34 63h52l-7 32H41z" />
    </>
  ),
  jarra: (
    <>
      <path d="M30 22l16 4h28l3 10q11 22 7 46q-2 14-14 14H52q-12 0-14-14q-4-24 6-46l-2-6z" />
      <path d="M80 40q18 2 14 28q-2 12-12 16" {...trazo} strokeWidth="6" />
    </>
  ),
  mantequera: (
    <>
      <path d="M24 74h72v10a5 5 0 0 1-5 5H29a5 5 0 0 1-5-5z" />
      <path d="M30 72h60V58q0-16-16-16H46q-16 0-16 16z" />
      <rect x="53" y="33" width="14" height="10" rx="4" />
    </>
  ),
  portasahumerio: (
    <>
      <ellipse cx="60" cy="86" rx="42" ry="8" />
      <ellipse cx="60" cy="80" rx="8" ry="5" />
      <path d="M60 80L84 30" {...trazo} strokeWidth="2.6" />
      <path d="M85 27q-6-6 0-12t0-12" {...trazo} strokeWidth="1.4" opacity=".6" />
    </>
  ),
  'florero-alto': <path d="M52 14h16v9q0 6 6 12q12 13 12 36q0 26-9 33H43q-9-7-9-33q0-23 12-36q6-6 6-12z" />,
  'fuente-ovalada': (
    <>
      <ellipse cx="60" cy="64" rx="54" ry="18" />
      <ellipse cx="60" cy="62" rx="40" ry="11" {...pozo} />
    </>
  ),
  pocillos: (
    <>
      {[6, 34, 62, 90].map((x) => (
        <g key={x} transform={`translate(${x} 52)`}>
          <path d="M0 0h18v13a9 9 0 0 1-9 9a9 9 0 0 1-9-9z" />
          <path d="M18 4a5 5 0 0 1 0 10" {...trazo} strokeWidth="3" />
        </g>
      ))}
      <rect x="4" y="78" width="112" height="3" rx="1.5" />
    </>
  ),
  cucharita: (
    <g transform="rotate(-24 60 60)">
      <ellipse cx="34" cy="60" rx="17" ry="11" />
      <rect x="48" y="57" width="58" height="6" rx="3" />
    </g>
  ),
}

export default function Silueta({ id, className = '' }) {
  return (
    <svg viewBox="0 0 120 120" fill="currentColor" aria-hidden="true" focusable="false" className={className}>
      {FORMAS[id]}
    </svg>
  )
}
