// components/ui/SelectMenu.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export default function SelectMenu({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select…",
  className = "",
  buttonClassName = "",
  itemClassName = "",
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(
    Math.max(0, options.findIndex(o => o.value === value))
  );
  const rootRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    }
    function onEsc(e) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  const current = options.find(o => o.value === value);

  function commit(idx) {
    const opt = options[idx];
    if (!opt) return;
    onChange?.(opt.value);
    setOpen(false);
  }

  function onKeyDown(e) {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault(); setOpen(true);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(i => Math.min(options.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(i => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault(); commit(activeIndex);
    } else if (e.key === "Escape") {
      e.preventDefault(); setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {label ? <span className="text-sm">{label}</span> : null}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        onKeyDown={onKeyDown}
        className={`
          mt-1 w-full rounded-lg border px-3 py-2 bg-transparent
          border-zinc-300 dark:border-zinc-700
          flex items-center justify-between
          focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400
          ${buttonClassName}
        `}
      >
        <span className={`truncate ${current ? "" : "text-zinc-500"}`}>
          {current?.label ?? placeholder}
        </span>
        <ChevronDown className="w-4 h-4 opacity-70" />
      </button>

      {open && (
        <div
          className="absolute z-50 mt-1 w-full rounded-lg border
                     border-zinc-200 dark:border-zinc-800
                     bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100
                     shadow-lg"
          role="listbox"
          ref={listRef}
          tabIndex={-1}
        >
          <ul className="max-h-56 overflow-auto py-1">
            {options.map((opt, idx) => {
              const active = idx === activeIndex;
              const selected = opt.value === value;
              return (
                <li
                  key={opt.value}
                  data-index={idx}
                  role="option"
                  aria-selected={selected}
                  className={`
                    px-3 py-2 text-sm cursor-pointer
                    ${active ? "bg-zinc-100 dark:bg-zinc-800" : ""}
                    ${selected ? "font-medium" : ""}
                    ${itemClassName}
                  `}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => commit(idx)}
                >
                  {opt.label}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
