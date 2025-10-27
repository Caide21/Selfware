import { useEffect, useRef } from 'react';

export default function AutoGrowTextarea({ value, onChange, minRows = 3, className = '', ...props }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.rows = minRows;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value, minRows]);

  const handleChange = (event) => {
    if (onChange) onChange(event);
    const el = event.target;
    requestAnimationFrame(() => {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
      const { top, bottom } = el.getBoundingClientRect();
      if (bottom > window.innerHeight) {
        el.scrollIntoView({ behavior: 'smooth', block: 'end' });
      } else if (top < 0) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  };

  return (
    <textarea
      ref={ref}
      className={`w-full resize-none bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400/60 ${className}`}
      value={value}
      onChange={handleChange}
      rows={minRows}
      {...props}
    />
  );
}
