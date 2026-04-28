"use client";

import { useEffect } from "react";

type DigitInlineProps = {
  className?: string;
  title?: string;
  subtitle?: string;
  src?: string;
};

export default function DigitInline({
  className = "",
  title = "Digit",
  subtitle = "Standing by",
  src = "/worlds/digit/models/digit.glb",
}: DigitInlineProps) {
  useEffect(() => {
    import("@google/model-viewer");
  }, []);

  return (
    <div
      className={[
        "rounded-2xl border border-slate-900/10 bg-white/70 backdrop-blur",
        "shadow-[0_10px_30px_rgba(2,6,23,0.08)]",
        className,
      ].join(" ")}
    >
      <div className="flex items-center justify-between px-4 pt-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          <div className="text-xs text-slate-600">{subtitle}</div>
        </div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">
          3D
        </div>
      </div>

      <div className="px-3 pb-4 pt-3">
        {/* Locked model window: no controls, no zoom, no prompts */}
        <div className="aspect-square w-full overflow-hidden rounded-xl border border-slate-900/10 bg-slate-50">
          <model-viewer
            src={src}
            // Locked: DO NOT add camera-controls. (Presence enables interaction.)
            interaction-prompt="none"
            disable-zoom
            shadow-intensity="0.6"
            environment-image="neutral"
            camera-orbit="0deg 75deg 2.2m"
            style={{ width: "100%", height: "100%", display: "block" }}
          />
        </div>
      </div>
    </div>
  );
}
