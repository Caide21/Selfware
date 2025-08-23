import React, { useEffect, useRef, useState } from 'react';
import ERS_STATE_MODE from '@/utils/plugins/ers/ersStateMode';
import {
  getERSState,
  subscribe as subscribeERS,
} from '@/utils/plugins/ers/SilentERSManager';

/**
 * ERSWrapper
 * ----------
 * • Adds data-attributes for ERS behaviour tracking.
 * • Subscribes to SilentERSManager and short-circuits any
 *   fog / symbolic overlays while the system is still in
 *   PASSIVE mode (no user phrasing submitted yet).
 */
export default function ERSWrapper({
  type = 'hover',
  label = 'ERSWrapped',
  children,
}) {
  const ref = useRef(null);
  const [ersState, setErsState] = useState(getERSState());

  // -- subscribe to global ERS state -------------------------
  useEffect(() => subscribeERS(setErsState), []);

  // -- set tracking attributes after mount ------------------
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.setAttribute('data-ers-track', type);
    el.setAttribute('data-ers-label', label);
  }, [type, label]);

  // -- PASSIVE-mode guard ------------------------------------
  if (ersState === ERS_STATE_MODE.PASSIVE) {
    // Render children without any fog or resonance overlays
    return <div ref={ref}>{children}</div>;
  }

  /* ---------------------------------------------------------
   * ACTIVE / REFLECTIVE rendering path
   * (existing or future fog / resonance layers go below)
   * ------------------------------------------------------- */
  return <div ref={ref}>{children}</div>;
}
