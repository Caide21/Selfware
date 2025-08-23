/*  ersBehaviorTracker.js
    ---------------------------------------------------------
    Passive signal logger for the Emotional Resonance System (ERS)

    • Captures   – idle-time, scroll freezes, hover hesitation,
                   and interaction aborts
    • Stores     – session-local snapshots in memory and localStorage
    • Updates    – notifies live React subscribers via subscribeSnapshots
    • Sends      – to backend endpoint only when ERS state ≥ ACTIVE
*/

import ERS_STATE_MODE from '@/utils/plugins/ers/ersStateMode';
import {
  getERSState,
  subscribe as subscribeERS,
} from '@/utils/plugins/ers/SilentERSManager';

/* ────────────────────────────────────────────────────────── */
/* Internal state                                            */
/* ────────────────────────────────────────────────────────── */
let idleTimer = null;
let lastInteraction = Date.now();
let scrollTimeout = null;
let hoverTimers = new Map();

const snapshots = [];               // in-memory store
const snapshotListeners = new Set(); // live-update subscribers
let currentERSState = getERSState();

/* React to global ERS state changes ----------------------- */
subscribeERS((s) => (currentERSState = s));

/* ────────────────────────────────────────────────────────── */
/* Public getters & subscription API                         */
/* ────────────────────────────────────────────────────────── */
export function getSnapshots() {
  return snapshots;
}

/** Subscribe to snapshot changes; returns an unsubscribe fn */
export function subscribeSnapshots(cb) {
  if (typeof cb !== 'function') return () => {};
  snapshotListeners.add(cb);
  cb([...snapshots]);                      // push current state immediately
  return () => snapshotListeners.delete(cb);
}

/* ────────────────────────────────────────────────────────── */
/* Initialiser                                               */
/* ────────────────────────────────────────────────────────── */
export function initERS({ endpoint = null, onFeedback = null } = {}) {
  /* 1) Idle detection ------------------------------------- */
  idleTimer = setInterval(() => {
    const now = Date.now();
    const idleTime = (now - lastInteraction) / 1000; // seconds
    if (idleTime > 10) pushSnapshot('idle', idleTime);
  }, 5000);

  /* 2) Scroll freeze detection ---------------------------- */
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(
      () => pushSnapshot('scroll-freeze', 3),
      3000
    );
    lastInteraction = Date.now();
  });

  /* 3) Hover hesitation detection ------------------------- */
  document.querySelectorAll('.ers-track-hover').forEach((el) => {
    el.addEventListener('mouseenter', () => hoverTimers.set(el, Date.now()));
    el.addEventListener('mouseleave', () => {
      const enterTime = hoverTimers.get(el);
      if (!enterTime) return;
      const duration = Date.now() - enterTime;
      if (duration > 3000)
        pushSnapshot('hover-hesitation', duration / 1000, el.dataset.ersLabel);
      hoverTimers.delete(el);
    });
  });

  /* 4) Interaction abort ---------------------------------- */
  document.querySelectorAll('.ers-track-abort').forEach((el) => {
    el.addEventListener('click', () => {
      setTimeout(() => {
        // still on same domain → treat as abort
        if (document.referrer && document.referrer.includes(location.hostname))
          pushSnapshot('interaction-abort', 0, el.dataset.ersLabel);
      }, 2000);
    });
  });

  /* Reset idle timer on any activity ---------------------- */
  ['mousemove', 'keydown', 'mousedown', 'touchstart'].forEach((evt) =>
    window.addEventListener(evt, () => (lastInteraction = Date.now()))
  );

  /* Helper: push snapshot + optional send ----------------- */
  function pushSnapshot(signalType, value, label = null) {
    const snap = {
      signalType,
      value, // seconds or 0
      label,
      ersStateAtCapture: currentERSState,
      timestamp: new Date().toISOString(),
    };

    snapshots.push(snap);

    /* Persist to localStorage ----------------------------- */
    try {
      localStorage.setItem('ERS_SNAPS', JSON.stringify(snapshots));
    } catch (_) {
      /* ignore quota / SSR context */
    }

    /* Notify live subscribers ----------------------------- */
    snapshotListeners.forEach((cb) => cb([...snapshots]));

    /* Send to backend if ERS is active -------------------- */
    if (endpoint && currentERSState !== ERS_STATE_MODE.PASSIVE) {
      sendERS(endpoint, snap, onFeedback);
    }
  }
}

/* ────────────────────────────────────────────────────────── */
async function sendERS(endpoint, payload, callback) {
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (callback) callback(data);
  } catch (err) {
    console.error('ERS send error:', err);
  }
}
