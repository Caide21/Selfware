// src/app/layout.tsx

import type { ReactNode } from 'react';
import './globals.css';

import { ZoneProvider } from '@/worlds/core/ZoneContext';
import HudStrip from '@/worlds/hud/HudStrip';
import DigitAvatar from '@/worlds/digit/DigitAvatar';

export const metadata = {
  title: 'Selfware',
  description: 'Your personal OS for reality.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <ZoneProvider>
          <div className="flex min-h-screen flex-col">
            {/* Top HUD strip */}
            <HudStrip />

            <div className="relative flex flex-1">
              {/* Digit avatar overlay (corner) */}
              <DigitAvatar />

              {/* Main zone content (status/quests/habits/...) */}
              <main className="flex-1">{children}</main>
            </div>
          </div>
        </ZoneProvider>
      </body>
    </html>
  );
}
