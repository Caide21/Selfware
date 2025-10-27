export function ensureObject(name, v) {
  if (!v || typeof v !== "object" || Array.isArray(v)) {
    throw new Error(`${name} must be an object`);
  }
}
export function ensureArray(name, v) {
  if (!Array.isArray(v)) throw new Error(`${name} must be an array`);
}


