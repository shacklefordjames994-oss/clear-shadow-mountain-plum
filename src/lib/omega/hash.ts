function fnv1a(value: string, seed = 2166136261): number {
  let h = seed;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function omegaHash(value: string): string {
  const a = fnv1a(value).toString(16).padStart(8, "0");
  const b = fnv1a(value, 0x811c9dc5 ^ value.length).toString(16).padStart(8, "0");
  return `om_${a}${b}`;
}

export function hashObject(value: unknown): string {
  return omegaHash(stableStringify(value));
}

export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
}

export function shortId(prefix: string, n: number): string {
  return `${prefix}_${String(n).padStart(6, "0")}`;
}
