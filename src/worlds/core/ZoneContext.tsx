// src/worlds/core/ZoneContext.tsx

'use client';

import React, { createContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ZONES_BY_ID, type ZoneConfig, type ZoneId } from './zones';

export interface ZoneContextValue {
  activeZoneId: ZoneId;
  activeZone: ZoneConfig;
  setActiveZoneId: (zoneId: ZoneId) => void;
}

export const ZoneContext = createContext<ZoneContextValue | undefined>(
  undefined,
);

interface ZoneProviderProps {
  children: ReactNode;
  initialZoneId?: ZoneId;
}

/**
 * ZoneProvider
 * Wrap the entire app (in app/layout.tsx) so HUD, Digit, pages, etc.
 * can all read/write the current zone.
 */
export function ZoneProvider({
  children,
  initialZoneId = 'status',
}: ZoneProviderProps) {
  const [activeZoneId, setActiveZoneId] = useState<ZoneId>(initialZoneId);

  const value = useMemo<ZoneContextValue>(() => {
    const activeZone = ZONES_BY_ID[activeZoneId];

    return {
      activeZoneId,
      activeZone,
      setActiveZoneId,
    };
  }, [activeZoneId]);

  return (
    <ZoneContext.Provider value={value}>{children}</ZoneContext.Provider>
  );
}
