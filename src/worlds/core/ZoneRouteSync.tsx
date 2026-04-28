'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

import { ZONES, type ZoneId } from './zones';
import { useZoneState } from './useZoneState';

function resolveZoneIdFromPath(pathname: string | null): ZoneId | null {
  if (!pathname) return null;

  // Prefer most-specific match (longest path wins).
  const matches = ZONES.filter((z) => {
    if (z.path === '/') return pathname === '/';
    return pathname === z.path || pathname.startsWith(`${z.path}/`);
  }).sort((a, b) => b.path.length - a.path.length);

  return matches[0]?.id ?? null;
}

export default function ZoneRouteSync() {
  const pathname = usePathname();
  const { activeZoneId, setActiveZoneId } = useZoneState();

  useEffect(() => {
    const nextId = resolveZoneIdFromPath(pathname);
    if (!nextId) return;
    if (nextId === activeZoneId) return;
    setActiveZoneId(nextId);
  }, [pathname, activeZoneId, setActiveZoneId]);

  return null;
}
