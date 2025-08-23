/*  SilentERSManager.js
    ---------------------------------------------------------
    Global singleton for managing ERS state across the app.

    • Holds current state   (PASSIVE | ACTIVE | REFLECTIVE)
    • Persists to localStorage so unlock survives reloads
    • Publishes change events to subscribed listeners
*/

import ERS_STATE_MODE from '@/utils/plugins/ers/ersStateMode';

const STORAGE_KEY = 'ERS_STATE';

// ---- internal state ----------------------------------------------------
let currentState = loadInitialState();
const listeners = new Set();

// ---- helpers -----------------------------------------------------------
function loadInitialState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw && Object.values(ERS_STATE_MODE).includes(raw)) return raw;
  } catch (_) {/* SSR or privacy mode */}
  return ERS_STATE_MODE.PASSIVE;            // default
}

function notify() {
  listeners.forEach((cb) => cb(currentState));
}

// ---- public API --------------------------------------------------------
export function getERSState() {
  return currentState;
}

export function setERSState(newState) {
  if (!Object.values(ERS_STATE_MODE).includes(newState)) {
    console.warn(`[SilentERSManager] Invalid state: ${newState}`);
    return;
  }
  if (newState === currentState) return;

  currentState = newState;
  try {
    localStorage.setItem(STORAGE_KEY, currentState);
  } catch (_) {/* ignore quota / SSR */}
  notify();
}

export function subscribe(callback) {
  if (typeof callback !== 'function') return () => {};
  listeners.add(callback);
  // Return unsubscribe
  return () => listeners.delete(callback);
}

// convenience: reset (mostly for tests / dev console)
export function _resetERSState() {
  currentState = ERS_STATE_MODE.PASSIVE;
  localStorage.removeItem(STORAGE_KEY);
  notify();
}
