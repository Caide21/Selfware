export const PsytripFlags = {
  enabled: false,
  drift: true,
  parallax: true,
  noise: true,
};

export function enablePsytrip(opts = {}) {
  Object.assign(PsytripFlags, { enabled: true }, opts);
}

export function disablePsytrip() {
  PsytripFlags.enabled = false;
}

export function PsytripField() {
  if (!PsytripFlags.enabled) return null;

  return (
    <div
      aria-hidden
      className={[
        'pointer-events-none fixed inset-0 -z-10 will-change-transform',
        '[background:radial-gradient(1200px_700px_at_20%_10%,var(--p-rose)/32,transparent_50%),radial-gradient(1000px_600px_at_80%_30%,var(--p-teal)/26,transparent_55%),radial-gradient(1200px_800px_at_50%_90%,var(--p-amber)/22,transparent_60%)]',
      ].join(' ')}
    >
      {PsytripFlags.noise ? (
        <div className="absolute inset-0 opacity-[0.35] [background-image:url('/noise.png')] mix-blend-soft-light" />
      ) : null}

      <style jsx>{`
        @media (prefers-reduced-motion: no-preference) {
          :global(html.psytrip-drift) .psytrip-drift {
            animation: psytrip-hue 18s linear infinite;
          }
          @keyframes psytrip-hue {
            from {
              filter: hue-rotate(0deg);
            }
            to {
              filter: hue-rotate(360deg);
            }
          }
        }
      `}</style>
      <div className={`psytrip-drift ${PsytripFlags.drift ? '' : 'opacity-0'}`} />
    </div>
  );
}
