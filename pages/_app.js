import '../styles/globals.css';
import '../styles/z-layer.css';
import '../styles/fog.css'; // dYO? visual fog overlays (only show when ERS is ACTIVE)
import '../styles/enchantments.css';
import '../styles/prism-paper.css';

import PageShell from '../components/Layout/PageShell';
import Nav from '../components/Layout/Nav';
import { assertSupabaseEnv } from '@/lib/supabaseEnvGuard';

import { useEffect } from 'react';
import Head from 'next/head';
import { initERS } from '../utils/plugins/ers/ersBehaviorTracker';
import { triggerFog, pulseSigil } from '../utils/plugins/ers/fogEngine';

export default function App({ Component, pageProps }) {
  /* ---------------------------------------------------------------
     Boot the ERS passive tracker once on first client render.
     It silently logs behaviour while ERS_STATE_MODE === PASSIVE.
     When state flips to ACTIVE, onFeedback will start firing.
  ----------------------------------------------------------------*/
  useEffect(() => {
    assertSupabaseEnv();
    initERS({
      // (Optional) backend endpoint to stream events
      endpoint: '/api/classify',

      // Callback fires only when ERS is ACTIVE or REFLECTIVE
      onFeedback: ({ emotion, fog }) => {
        console.log('dY�z ERS feedback:', { emotion, fog });
        triggerFog(fog); // Inject symbolic fog overlay
        pulseSigil(emotion); // Pulse emotion-linked sigil (placeholder)
      },
    });
  }, []);

  const showCorridorSpine = Component.showCorridorSpine ?? true;

  return (
    <PageShell showCorridorSpine={showCorridorSpine}>
      <Head>
        <meta name="theme-color" content="#FFFFFF" />
      </Head>
      <Nav />
      <Component {...pageProps} />
    </PageShell>
  );
}
