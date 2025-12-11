// src/worlds/core/useZoneState.ts

'use client';

import { useContext } from 'react';
import { ZoneContext } from './ZoneContext';

export function useZoneState() {
  const ctx = useContext(ZoneContext);

  if (!ctx) {
    throw new Error('useZoneState must be used within a <ZoneProvider>');
  }

  return ctx;
}
