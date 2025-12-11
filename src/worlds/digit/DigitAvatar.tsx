'use client';

import React from 'react';
import { useZoneState } from '@/worlds/core/useZoneState';

const DigitAvatar: React.FC = () => {
  const { activeZone } = useZoneState();

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-40">
      <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-slate-700/60 bg-slate-950/90 px-3 py-2 shadow-lg shadow-black/40 backdrop-blur">
        {/* Avatar bubble – swap this for your 3D canvas later */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 text-[0.65rem] font-semibold text-white">
          3D
        </div>

        {/* Small status text */}
        <div className="hidden text-xs leading-tight text-slate-100 sm:block">
          <div className="font-medium">Digit</div>
          <div className="text-[0.7rem] text-slate-400">
            Watching {activeZone.label}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitAvatar;
