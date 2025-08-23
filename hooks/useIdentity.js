import { useEffect, useState } from 'react';
import { getFingerprint } from '@/utils/fingerprint';

export function useIdentity() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    async function init() {
      try {
        const fingerprint = await getFingerprint();
        console.log("Generated fingerprint:", fingerprint);

        const res = await fetch('/api/session/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fingerprint }),
        });

        const { session } = await res.json();
        setSession(session);
      } catch (err) {
        console.error('Session init failed:', err);
      }
    }

    init();
  }, []);

  return session;
}