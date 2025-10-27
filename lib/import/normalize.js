export function splitTags(s) {
  if (!s) return [];
  return String(s).split(/[;,]/).map(x => x.trim()).filter(Boolean);
}

export function num(v) {
  if (v === "" || v === null || v === undefined) return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : v;
}

/**
 * Accepts either:
 *  - sectioned object: { sectionA: [...], sectionB: [...] }
 *  - row array:        [ { section: "sectionA", ... }, ... ]
 * Returns: { sectionA: [...], sectionB: [...] } with only the allowedSections.
 */
export function normalizeBySection(input, allowedSections, rowMapper) {
  const out = Object.fromEntries(allowedSections.map(k => [k, []]));

  if (Array.isArray(input)) {
    for (const r of input) {
      const s = String(r.section || "").toLowerCase();
      if (allowedSections.includes(s)) out[s].push(rowMapper(s, r));
    }
    return out;
  }

  if (input && typeof input === "object") {
    for (const s of allowedSections) {
      const arr = Array.isArray(input[s]) ? input[s] : [];
      out[s] = arr.map((r) => rowMapper(s, r));
    }
    return out;
  }

  return out;
}


