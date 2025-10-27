import { forwardRef } from "react";

const TextInput = forwardRef(function TextInput(
  { label, error, hint, className = "", ...rest },
  ref
){
  return (
    <label className="block space-y-1">
      {label && <span className="block text-sm font-medium text-text">{label}</span>}
      <input
        ref={ref}
        className={[
          "w-full rounded-md border border-slate-300 bg-white text-text",
          "px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary",
          "placeholder:text-text-muted",
          "min-h-[40px]",
          className
        ].join(" ")}
        {...rest}
      />
      {hint && !error && <span className="block text-xs text-text-muted">{hint}</span>}
      {error && <span className="block text-xs text-tertiary">{error}</span>}
    </label>
  );
});

export default TextInput;


