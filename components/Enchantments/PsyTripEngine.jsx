import { useEffect } from 'react';

export default function PsyTripEngine({ active }) {
  useEffect(() => {
    if (!active) {
      document.documentElement.classList.remove('psy-trip');
      return;
    }

    document.documentElement.classList.add('psy-trip');
    let t = 0;
    const interval = setInterval(() => {
      t += 0.02;
      const intensity = Math.min(t / 12, 1); // curve from 0 to 1 over 30s
      document.documentElement.style.setProperty('--time', t);
      document.documentElement.style.setProperty('--psyIntensity', intensity);
    }, 16);

    return () => {
      clearInterval(interval);
      document.documentElement.classList.remove('psy-trip');
      document.documentElement.style.setProperty('--psyIntensity', 0);
    };
  }, [active]);

  return null;
}