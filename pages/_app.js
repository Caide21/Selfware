import '../styles/globals.css';
import '../styles/z-layer.css';
import '../styles/fog.css'; // 🌀 visual fog overlays (only show when ERS is ACTIVE)
import '../styles/enchantments.css';

import Layout from '../components/Layout/PageShell';
import Nav from '../components/Layout/Nav';
import { ThemeProvider } from '../context/ThemeContext';

import { useEffect } from 'react';
import { initERS } from '../utils/plugins/ers/ersBehaviorTracker';
import { triggerFog, pulseSigil } from '../utils/plugins/ers/fogEngine';

export default function App({ Component, pageProps }) {
  /* ---------------------------------------------------------------
     Boot the ERS passive tracker once on first client render.
     It silently logs behaviour while ERS_STATE_MODE === PASSIVE.
     When state flips to ACTIVE, onFeedback will start firing.
  ----------------------------------------------------------------*/
  useEffect(() => {
    initERS({
      // (Optional) backend endpoint to stream events
      endpoint: '/api/classify',

      // Callback fires only when ERS is ACTIVE or REFLECTIVE
      onFeedback: ({ emotion, fog }) => {
        console.log('🪞 ERS feedback:', { emotion, fog });
        triggerFog(fog);          // Inject symbolic fog overlay
        pulseSigil(emotion);      // Pulse emotion-linked sigil (placeholder)
      },
    });
  }, []);

  /* Layout wrapper (unchanged) */
  const getLayout =
    Component.getLayout ||
    ((page) => (
      <ThemeProvider>
        <Layout>
          <Nav />
          {page}
        </Layout>
      </ThemeProvider>
    ));

  return getLayout(<Component {...pageProps} />);
}
