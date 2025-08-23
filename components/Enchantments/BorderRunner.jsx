// components/Enchantments/BorderRunner.jsx
import { useId } from 'react';

export default function BorderRunner({
  color = 'rgb(167 139 250)',
  glowColor = null,
  width = 2,
  duration = 2.8,
  segment = 160,
  direction = 'cw',
  mode = 'always', // 'always' | 'hover' | 'paused'
  radius = 20,

  // Tracks
  showWhiteTrack = true,
  whiteTrackColor = 'rgba(255,255,255,0.7)',
  whiteTrackWidth = 1.25,
  showPurpleTrack = true,
  purpleTrackColor = 'rgba(167,139,250,0.35)',
  purpleTrackWidth = 1,

  className = '',
}) {
  const id = useId();
  const dirMul = direction === 'ccw' ? 1 : -1;
  const glow = glowColor ?? color;

  const pxToView = (px, basis = 560) =>
    Math.max(0, Math.min(50, (px / basis) * 100));
  const r = pxToView(radius);

  // PAD scales with the biggest stroke so nothing gets clipped on any edge
  const maxStroke = Math.max(whiteTrackWidth, purpleTrackWidth, width * 2.2);
  const snapHalf = (v) => Math.round(v * 2) / 2;
  const PAD = snapHalf(Math.max(1.25, (maxStroke / 2) + 0.5));

  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className={modeClass(mode)}
        shapeRendering="geometricPrecision"
        style={{
          '--runner-color': color,
          '--runner-glow': glow,
          '--runner-w': `${width}px`,
          '--runner-dur': `${duration}s`,
          '--runner-dir': dirMul,
          '--runner-seg': segment,
        }}
      >
        <defs>
          <clipPath id={`${id}-clip`}>
            <rect x={PAD} y={PAD} width={100 - PAD * 2} height={100 - PAD * 2} rx={r} />
          </clipPath>

          <filter id={`${id}-glow`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
            <feColorMatrix in="blur" type="matrix" values="
              0 0 0 0 0
              0 0 0 0 0
              0 0 0 0 0
              0 0 0 0.9 0" result="alpha" />
            <feMerge><feMergeNode in="alpha" /></feMerge>
          </filter>
        </defs>

        <g clipPath={`url(#${id}-clip)`}>
          {showWhiteTrack && (
            <rect
              x={PAD} y={PAD} width={100 - PAD * 2} height={100 - PAD * 2}
              rx={r} pathLength="1000" fill="none"
              stroke={whiteTrackColor} strokeWidth={whiteTrackWidth}
              vectorEffect="non-scaling-stroke" strokeLinejoin="round"
            />
          )}

          {showPurpleTrack && (
            <rect
              x={PAD} y={PAD} width={100 - PAD * 2} height={100 - PAD * 2}
              rx={r} pathLength="1000" fill="none"
              stroke={purpleTrackColor} strokeWidth={purpleTrackWidth}
              vectorEffect="non-scaling-stroke" strokeLinejoin="round"
            />
          )}

          {/* glow */}
          <rect
            x={PAD} y={PAD} width={100 - PAD * 2} height={100 - PAD * 2}
            rx={r} pathLength="1000" fill="none"
            stroke="var(--runner-glow)" strokeWidth={width * 2.2}
            strokeLinecap="round" strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            shapeRendering="crispEdges"
            style={{
              filter: `url(#${id}-glow)`,
              strokeDasharray: `var(--runner-seg) ${1000 - Number(segment)}`,
              strokeDashoffset: 0,
            }}
            className="runner-line"
          />

          {/* runner */}
          <rect
            x={PAD} y={PAD} width={100 - PAD * 2} height={100 - PAD * 2}
            rx={r} pathLength="1000" fill="none"
            stroke="var(--runner-color)" strokeWidth="var(--runner-w)"
            strokeLinecap="round" strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            shapeRendering="crispEdges"
            style={{
              strokeDasharray: `var(--runner-seg) ${1000 - Number(segment)}`,
              strokeDashoffset: 0,
            }}
            className="runner-line"
          />
        </g>

        <style jsx>{`
          .runner-line { opacity: 0; }
          @keyframes orbit { to { stroke-dashoffset: calc(var(--runner-dir) * 1000); } }
          .mode-always .runner-line { opacity: 1; animation: orbit var(--runner-dur) linear infinite; }
          :global(.group:hover) .mode-hover .runner-line { opacity: 1; animation: orbit var(--runner-dur) linear infinite; }
          .mode-paused .runner-line { opacity: 1; }
        `}</style>
      </svg>
    </div>
  );
}

function modeClass(mode) {
  if (mode === 'always') return 'mode-always';
  if (mode === 'paused') return 'mode-paused';
  return 'mode-hover';
}