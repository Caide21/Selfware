import React, { useEffect } from 'react';
import tokens from './tokens';

export default function PrismPaperProvider({ children }) {
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', tokens.name);

    const { colors, gradients, radii, shadows } = tokens;
    root.style.setProperty('--pp-text', colors.text);
    root.style.setProperty('--pp-muted', colors.muted);
    root.style.setProperty('--pp-surface', colors.surface);
    root.style.setProperty('--pp-section', colors.section);
    root.style.setProperty('--pp-violet', colors.violet);
    root.style.setProperty('--pp-mint', colors.mint);
    root.style.setProperty('--pp-coral', colors.coral);
    root.style.setProperty('--pp-info', colors.info);
    root.style.setProperty('--pp-gradient', gradients.rainbow);
    root.style.setProperty('--pp-radius-sm', radii.sm);
    root.style.setProperty('--pp-radius-md', radii.md);
    root.style.setProperty('--pp-radius-lg', radii.lg);
    root.style.setProperty('--pp-radius-pill', radii.pill);
    root.style.setProperty('--pp-shadow-soft', shadows.soft);
    root.style.setProperty('--pp-shadow-hover', shadows.hover);
  }, []);

  return (
    <>
      <div className="pp-bg fixed inset-0 -z-10" aria-hidden="true" />
      {children}
    </>
  );
}
