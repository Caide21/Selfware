'use client';

import { useEffect } from 'react';

export default function DigitAvatar() {
  useEffect(() => {
    import('@google/model-viewer');
  }, []);

  return (
    <div className="fixed bottom-16 left-6 z-50">
      {/* Simple viewport: no card chrome, just a clean frame */}
      <div className="h-[180px] w-[180px] overflow-hidden rounded-2xl bg-white/70 backdrop-blur border border-slate-900/10 shadow-[0_12px_30px_rgba(2,6,23,0.18)]">
        <model-viewer
          src="/worlds/digit/models/digit.glb"
          interaction-prompt="none"
          disable-zoom
          environment-image="neutral"
          shadow-intensity="0.7"
          camera-orbit="0deg 75deg 2.2m"
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </div>

      {/* Optional tiny label (keep subtle, remove if Caide wants pure model) */}
      <div className="mt-2 text-xs text-slate-600">
        <div className="font-semibold text-slate-800">Digit</div>
        <div className="text-[11px]">Watching Habits</div>
      </div>
    </div>
  );
}
