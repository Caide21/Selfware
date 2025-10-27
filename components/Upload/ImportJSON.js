import { useRef, useState } from "react";

/**
 * Generic JSON importer.
 * Props:
 *  - onData(input: any): void   // caller normalizes
 *  - title?: string
 *  - className?: string
 */
export default function ImportJSON({ onData, title = "Import JSON", className = "" }) {
  const fileRef = useRef(null);
  const [err, setErr] = useState("");

  async function handleFiles(files) {
    setErr("");
    const file = files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".json")) {
      setErr("Please select a .json file.");
      return;
    }
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      onData?.(data);
    } catch (e) {
      setErr("Invalid JSON: " + (e?.message || "parse error"));
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm ${className}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
    >
      <button
        className="rounded-full bg-cta-accent px-3 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg hover:brightness-110"
        onClick={() => fileRef.current?.click()}
      >
        {title}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".json,application/json"
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      <span className="text-xs text-text-muted">Drop or select a JSON file</span>
      {err ? <span className="ml-auto text-xs text-tertiary">{err}</span> : null}
    </div>
  );
}


