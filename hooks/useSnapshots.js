// hooks/useSnapshots.js
import { useState, useEffect } from 'react';
import {
  getSnapshots,
  subscribeSnapshots,
} from '@/utils/plugins/ers/ersBehaviorTracker';

/**
 * useSnapshots
 * -------------
 * React hook that returns the latest ERS behaviour
 * snapshot array and re-renders whenever it changes.
 */
export default function useSnapshots() {
  const [snaps, setSnaps] = useState(getSnapshots());

  useEffect(() => subscribeSnapshots(setSnaps), []);
  return snaps;
}
