import { forwardRef, useEffect, useRef } from "react";

const TextAreaAuto = forwardRef(function TextAreaAuto(
  { label, error, hint, className = "", maxRows, onInput, ...rest },
  ref
){
  const innerRef = useRef(null);

  useEffect(() => {
    if (!ref) return;
    if (typeof ref === "function") ref(innerRef.current);
    else ref.current = innerRef.current;
  }, [ref]);

  const adjust = () => {
    const el = innerRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
    if (maxRows) {
      const line = parseInt(getComputedStyle(el).lineHeight || "20", 10);
      const max = line * maxRows + 16;
      if (el.scrollHeight > max) {
        el.style.height = `${max}px`;
        el.style.overflowY = "auto";
      } else {
        el.style.overflowY = "hidden";
      }
    } else {
      el.style.overflowY = "hidden";
    }
    const nearBottom = el.scrollTop + el.clientHeight - 4;
    if (el.scrollHeight > nearBottom) {
      el.scrollTop = el.scrollHeight - el.clientHeight;
    }
    el.scrollIntoView({ block: "nearest" });
  };

  return (
    <label className="block space-y-1">
      {label && <span className="block text-sm font-medium text-text">{label}</span>}
      <textarea
        ref={innerRef}
        onInput={(e) => { adjust(); onInput?.(e); }}
        onFocus={adjust}
        className={[
          "w-full rounded-md border border-slate-300 bg-white text-text",
          "px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary",
          "placeholder:text-text-muted",
          "min-h-[72px] resize-none",
          className
        ].join(" ")}
        {...rest}
      />
      {hint && !error && <span className="block text-xs text-text-muted">{hint}</span>}
      {error && <span className="block text-xs text-tertiary">{error}</span>}
    </label>
  );
});

export default TextAreaAuto;


