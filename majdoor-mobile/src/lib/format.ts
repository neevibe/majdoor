/** Indian-style grouping: 2,48,312 */
export function formatIN(n: number): string {
  return n.toLocaleString('en-IN');
}

export function rupees(n: number): string {
  return `₹${formatIN(n)}`;
}

/** Compact Indian money: ₹3.18 Cr, ₹86.4 L, ₹42.3 K */
export function rupeesCompact(n: number): string {
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2).replace(/\.?0+$/, '')} Cr`;
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1).replace(/\.0$/, '')} L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1).replace(/\.0$/, '')} K`;
  return rupees(n);
}
