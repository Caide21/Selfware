const BASE_TONES = {
  ritual: {
    subtle: { bg: 'bg-purple-500/10', border: 'border-purple-400/40', text: 'text-purple-200', shadow: 'shadow-[0_0_12px_rgba(168,85,247,0.35)]' },
    balanced: { bg: 'bg-purple-500/20', border: 'border-purple-400/60', text: 'text-purple-100', shadow: 'shadow-[0_0_15px_rgba(168,85,247,0.45)]' },
    loud: { bg: 'bg-purple-500/25', border: 'border-purple-300/80', text: 'text-white', shadow: 'shadow-[0_0_18px_rgba(192,132,252,0.55)]' },
  },
  skill: {
    subtle: { bg: 'bg-amber-500/10', border: 'border-amber-400/40', text: 'text-amber-200', shadow: 'shadow-[0_0_12px_rgba(245,158,11,0.35)]' },
    balanced: { bg: 'bg-amber-500/20', border: 'border-amber-400/60', text: 'text-amber-100', shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.45)]' },
    loud: { bg: 'bg-amber-500/25', border: 'border-amber-300/80', text: 'text-white', shadow: 'shadow-[0_0_18px_rgba(251,191,36,0.55)]' },
  },
  status: {
    subtle: { bg: 'bg-emerald-500/10', border: 'border-emerald-400/40', text: 'text-emerald-200', shadow: 'shadow-[0_0_12px_rgba(16,185,129,0.35)]' },
    balanced: { bg: 'bg-emerald-500/20', border: 'border-emerald-400/60', text: 'text-emerald-100', shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.45)]' },
    loud: { bg: 'bg-emerald-500/25', border: 'border-emerald-300/80', text: 'text-white', shadow: 'shadow-[0_0_18px_rgba(110,231,183,0.55)]' },
  },
  constraint: {
    subtle: { bg: 'bg-slate-500/10', border: 'border-slate-400/40', text: 'text-slate-200', shadow: 'shadow-[0_0_12px_rgba(148,163,184,0.35)]' },
    balanced: { bg: 'bg-slate-500/20', border: 'border-slate-400/60', text: 'text-slate-100', shadow: 'shadow-[0_0_15px_rgba(148,163,184,0.45)]' },
    loud: { bg: 'bg-slate-500/30', border: 'border-slate-300/80', text: 'text-white', shadow: 'shadow-[0_0_18px_rgba(203,213,225,0.55)]' },
  },
  success: {
    subtle: { bg: 'bg-teal-500/10', border: 'border-teal-400/40', text: 'text-teal-200', shadow: 'shadow-[0_0_12px_rgba(20,184,166,0.35)]' },
    balanced: { bg: 'bg-teal-500/20', border: 'border-teal-400/60', text: 'text-teal-100', shadow: 'shadow-[0_0_15px_rgba(20,184,166,0.45)]' },
    loud: { bg: 'bg-teal-500/30', border: 'border-teal-300/80', text: 'text-white', shadow: 'shadow-[0_0_18px_rgba(94,234,212,0.55)]' },
  },
  info: {
    subtle: { bg: 'bg-sky-500/10', border: 'border-sky-400/40', text: 'text-sky-200', shadow: 'shadow-[0_0_12px_rgba(56,189,248,0.35)]' },
    balanced: { bg: 'bg-sky-500/20', border: 'border-sky-400/60', text: 'text-sky-100', shadow: 'shadow-[0_0_15px_rgba(56,189,248,0.45)]' },
    loud: { bg: 'bg-sky-500/25', border: 'border-sky-300/80', text: 'text-white', shadow: 'shadow-[0_0_18px_rgba(125,211,252,0.55)]' },
  },
  warning: {
    subtle: { bg: 'bg-orange-500/10', border: 'border-orange-400/40', text: 'text-orange-200', shadow: 'shadow-[0_0_12px_rgba(249,115,22,0.35)]' },
    balanced: { bg: 'bg-orange-500/20', border: 'border-orange-400/60', text: 'text-orange-100', shadow: 'shadow-[0_0_15px_rgba(249,115,22,0.45)]' },
    loud: { bg: 'bg-orange-500/30', border: 'border-orange-300/80', text: 'text-white', shadow: 'shadow-[0_0_18px_rgba(253,186,116,0.55)]' },
  },
  danger: {
    subtle: { bg: 'bg-rose-500/10', border: 'border-rose-400/40', text: 'text-rose-200', shadow: 'shadow-[0_0_12px_rgba(244,63,94,0.35)]' },
    balanced: { bg: 'bg-rose-500/20', border: 'border-rose-400/60', text: 'text-rose-100', shadow: 'shadow-[0_0_15px_rgba(244,63,94,0.45)]' },
    loud: { bg: 'bg-rose-500/30', border: 'border-rose-300/80', text: 'text-white', shadow: 'shadow-[0_0_18px_rgba(248,113,113,0.55)]' },
  },
  neutral: {
    subtle: { bg: 'bg-zinc-500/10', border: 'border-zinc-400/40', text: 'text-zinc-200', shadow: 'shadow-[0_0_12px_rgba(161,161,170,0.30)]' },
    balanced: { bg: 'bg-zinc-500/15', border: 'border-zinc-400/60', text: 'text-zinc-100', shadow: 'shadow-[0_0_15px_rgba(212,212,216,0.35)]' },
    loud: { bg: 'bg-zinc-500/25', border: 'border-zinc-300/70', text: 'text-white', shadow: 'shadow-[0_0_18px_rgba(244,244,245,0.45)]' },
  },
};

export const BADGE_COLORS = BASE_TONES;

export function paletteFor(tone = 'neutral', grade = 'balanced') {
  const toneKey = tone in BASE_TONES ? tone : 'neutral';
  const gradeKey = grade in BASE_TONES[toneKey] ? grade : 'balanced';
  return BASE_TONES[toneKey][gradeKey];
}

export function fallbackTextClass(color) {
  if (!color || typeof color !== 'object') return 'text-white';
  return color.text || 'text-white';
}
