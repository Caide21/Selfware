export function toNum(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
export function betweenIndex(prev, next) {
  const A = toNum(prev?.order_index, 0);
  const B = toNum(next?.order_index, A + 2000);
  const gap = B - A;
  return gap > 1e-6 ? A + gap / 2 : null;
}
export function spacedIndex(i) {
  return (i + 1) * 100; // 100,200,300…
}


