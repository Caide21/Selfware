import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useState, useEffect } from 'react';
import PhaseShiftLayer from '../Enchantments/PhaseShiftLayer';
import PsyTripEngine from '../Enchantments/PsyTripEngine';
import PageWrapper from './PageWrapper';
import PageHeading from './PageHeading';
import useIdle from '@/hooks/useIdle';

export default function PageShell({ children, heading = null }) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const isIdle = useIdle(8000);
  const [themeColor, setThemeColor] = useState('purple');

  useEffect(() => {
    if (!pathname) return;

    if (pathname.includes('system-2')) setThemeColor('blue');
    else if (pathname.includes('system-1')) setThemeColor('purple');
    else setThemeColor('gold');

    console.log(`[PageShell] Path: ${pathname} → Theme: ${themeColor}`);
  }, [pathname]);

  return (
    <div
      data-theme-color={themeColor}
      className={`min-h-screen bg-gradient-to-b from-[#0c0a1e] to-black text-white ${
        theme === 'dark' ? 'dark' : ''
      }`}
    >
      <PhaseShiftLayer isIdle={isIdle} />
      <PsyTripEngine isIdle={isIdle} />

      {heading ? (
        <PageWrapper>
          <PageHeading
            emoji={heading.emoji}
            title={heading.title}
            subtitle={heading.subtitle}
          />
          {children}
        </PageWrapper>
      ) : (
        children
      )}
    </div>
  );
}
