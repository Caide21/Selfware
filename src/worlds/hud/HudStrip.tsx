'use client';

import React from 'react';
import { useZoneState } from '@/worlds/core/useZoneState';

const HudStrip: React.FC = () => {
  const { activeZone } = useZoneState();

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-slate-950/90 px-4 py-2 text-xs text-slate-100 backdrop-blur">
      <div className="flex items-center gap-2">
        <span className="text-lg">{activeZone.icon}</span>
        <div className="flex flex-col leading-tight">
          <span className="font-semibold tracking-wide uppercase">
            {activeZone.label}
          </span>
          {activeZone.shortDescription && (
            <span className="text-[0.7rem] text-slate-300">
              {activeZone.shortDescription}
            </span>
          )}
        </div>
      </div>

      <div className="text-[0.7rem] text-slate-400">
        Selfware · Prototype HUD
      </div>
    </header>
  );
};

export default HudStrip;
