import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { ThemeProvider } from '@/context/ThemeContext';
import { PrismPaperProvider } from '@/components/Themes/PrismPaper';
import PhaseShiftLayer from '../Enchantments/PhaseShiftLayer';
import PsyTripEngine from '../Enchantments/PsyTripEngine';
import PageHeading from './PageHeading';
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

function PageShellInner({ children, initialHeading = null, showCorridorSpine = true }) {
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

  const contextValue = useMemo(
    () => ({
      heading,
      setHeading,
    }),
    [heading]
  );

  return (
    <PageShellContext.Provider value={contextValue}>
      <PrismPaperProvider>
        <div
          data-theme-color={themeColor}
          className="min-h-screen text-text transition-colors"
        >
          <PhaseShiftLayer isIdle={isIdle} />
          <PsyTripEngine isIdle={isIdle} />

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
      </PrismPaperProvider>
    </PageShellContext.Provider>
  );
}

export default function PageShell({ children, heading = null, showCorridorSpine = true }) {
  return (
    <ThemeProvider>
      <PageShellInner initialHeading={heading} showCorridorSpine={showCorridorSpine}>
        {children}
      </PageShellInner>
    </ThemeProvider>
  );
}
