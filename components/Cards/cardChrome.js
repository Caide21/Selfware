export const baseCardClasses = 'w-full max-w-md rounded-2xl p-3 border space-y-3';

export const hoverClasses =
  'transition-transform transition-shadow duration-150 ease-out hover:-translate-y-[1px] hover:scale-[1.01] hover:shadow-[0_0_24px_rgba(34,211,238,0.45)]';

export const cardAccents = {
  quest: 'border-amber-300/70',
  habit: 'border-cyan-300/70',
};

export function cardShellClasses(accentClass = '') {
  return `${baseCardClasses} ${accentClass}`.trim();
}
