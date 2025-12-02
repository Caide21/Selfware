import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { ThemeProvider } from '@/context/ThemeContext';
import PrismThemeProvider from '@/theme/PrismThemeProvider';
import PhaseShiftLayer from '../Enchantments/PhaseShiftLayer';
import PageHeading from './PageHeading';
import { PsytripField, enablePsytrip, disablePsytrip, PsytripFlags } from '@/lib/psytrip/engine';
import useIdle from '@/hooks/useIdle';

const PageShellContext = createContext({
  heading: null,
  setHeading: () => {},
});

export function usePageShell() {
  return useContext(PageShellContext);
}

export function usePageHeading(heading) {
  const { setHeading } = usePageShell();

  useEffect(() => {
    setHeading(heading || null);
    return () => setHeading(null);
  }, [heading, setHeading]);
}

function PageShellInner({ children, initialHeading = null, showCorridorSpine = true, psytrip = false }) {
  const router = useRouter();
  const { pathname } = router;
  const isIdle = useIdle(8000);
  const [themeColor, setThemeColor] = useState('purple');
  const [heading, setHeading] = useState(initialHeading);

  useEffect(() => {
    setHeading(initialHeading || null);
  }, [initialHeading]);

  useEffect(() => {
    if (!pathname) return;

    const nextTheme = pathname.includes('system-2')
      ? 'blue'
      : pathname.includes('system-1')
      ? 'purple'
      : 'gold';

    setThemeColor(nextTheme);
    console.log(`[PageShell] Path: ${pathname} -> Theme: ${nextTheme}`);
  }, [pathname]);

  useEffect(() => {
    const resetHeading = () => setHeading(null);
    router.events?.on('routeChangeStart', resetHeading);
    return () => {
      router.events?.off('routeChangeStart', resetHeading);
    };
  }, [router.events]);

  useEffect(() => {
    const id = setTimeout(() => {
      // startAmbientAnimation?.();
    }, 50);
    return () => clearTimeout(id);
  }, [pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');

    const apply = () => {
      const allowMotion = !media.matches;
      if (psytrip && allowMotion) {
        enablePsytrip();
        if (PsytripFlags.drift) {
          document.documentElement.classList.add('psytrip-drift');
        } else {
          document.documentElement.classList.remove('psytrip-drift');
        }
      } else {
        disablePsytrip();
        document.documentElement.classList.remove('psytrip-drift');
      }
    };

    apply();

    const handleChange = () => apply();
    if (media.addEventListener) {
      media.addEventListener('change', handleChange);
    } else {
      media.addListener(handleChange);
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', handleChange);
      } else {
        media.removeListener(handleChange);
      }
      disablePsytrip();
      document.documentElement.classList.remove('psytrip-drift');
    };
  }, [psytrip]);

  const contextValue = useMemo(
    () => ({
      heading,
      setHeading,
    }),
    [heading]
  );

  return (
    <PageShellContext.Provider value={contextValue}>
      <PrismThemeProvider>
        <div data-theme-color={themeColor} className="min-h-screen bg-prism-app text-text transition-colors">
          <PsytripField />
          <PhaseShiftLayer isIdle={isIdle} />

          <main
            className={[
              showCorridorSpine ? 'corridor' : '',
              'relative min-h-screen pt-28 pb-24 px-6 sm:px-10',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <div className="mx-auto w-full max-w-7xl space-y-12">
              {heading ? (
                <PageHeading
                  emoji={heading.emoji}
                  title={heading.title}
                  subtitle={heading.subtitle}
                />
              ) : null}
              {children}
            </div>
          </main>
        </div>
      </PrismThemeProvider>
    </PageShellContext.Provider>
  );
}

export default function PageShell({ children, heading = null, showCorridorSpine = true, psytrip = false }) {
  return (
    <ThemeProvider>
      <PageShellInner initialHeading={heading} showCorridorSpine={showCorridorSpine} psytrip={psytrip}>
        {children}
      </PageShellInner>
    </ThemeProvider>
  );
}

