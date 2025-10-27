export default function ExportJSON({ getData, filename = "export.json" }) {
  return (
    <button
      className="rounded-full bg-cta-accent px-3 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg hover:brightness-110"
      onClick={() => {
        const data = getData?.(); if (!data) return;
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
        URL.revokeObjectURL(url);
      }}
    >Export JSON</button>
  );
}


