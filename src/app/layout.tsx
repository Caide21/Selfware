import '../../styles/globals.css';
import '../../styles/z-layer.css';
import '../../styles/fog.css';
import '../../styles/enchantments.css';
import '../../styles/prism-paper.css';

import type { ReactNode } from 'react';
import { ZoneProvider } from '@/worlds/core/ZoneContext';
import ZoneRouteSync from '@/worlds/core/ZoneRouteSync';
import DigitAvatar from '@/worlds/digit/DigitAvatar';
import AppNav from '@/components/Layout/AppNav';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <ZoneProvider>
          <ZoneRouteSync />

          <div className="flex min-h-screen flex-col">
            <AppNav />

            <div className="relative flex flex-1">
              <DigitAvatar />
              <main className="flex-1 pt-8">{children}</main>
            </div>

            <footer className="border-t border-slate-200/60 px-4 py-3 text-xs text-slate-500">
              Selfware · Prototype
            </footer>
          </div>
        </ZoneProvider>
      </body>
    </html>
  );
}
