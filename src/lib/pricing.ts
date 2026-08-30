/**
 * Alle prijslogica staat hier — één plek om tarieven later aan te passen.
 *
 * Tarieven (vaste staffel, gelijk voor alle collecties):
 * - losse foto:  € 5,00
 * - 5-pack:      € 22,50 (€ 4,50 p/foto, -10%)
 * - 10-pack:     € 40,00 (€ 4,00 p/foto, -20%)
 */
export const PRICE_TIERS = [
  { size: 1, cents: 500, label: "Losse foto" },
  { size: 5, cents: 2250, label: "5-pack" },
  { size: 10, cents: 4000, label: "10-pack" },
] as const;

export const SINGLE_PRICE_CENTS = 500;

/** Goedkoopste combinatie van staffels voor n foto's, in centen. */
export function totalCents(count: number): number {
  const n = Math.max(0, Math.floor(count));
  if (n === 0) return 0;
  const dp = new Array<number>(n + 1).fill(Number.POSITIVE_INFINITY);
  dp[0] = 0;
  for (let i = 1; i <= n; i += 1) {
    for (const tier of PRICE_TIERS) {
      const rest = Math.max(0, i - tier.size);
      dp[i] = Math.min(dp[i]!, dp[rest]! + tier.cents);
    }
  }
  return dp[n]!;
}

/** Prijs per foto (afgerond) — alleen voor weergave. */
export function unitCents(count: number): number {
  if (count <= 0) return SINGLE_PRICE_CENTS;
  return Math.round(totalCents(count) / count);
}

/** Korting in centen ten opzichte van losse foto's. */
export function savingsCents(count: number): number {
  return Math.max(0, count * SINGLE_PRICE_CENTS - totalCents(count));
}

/** Verdeelt het totaal over de regels zodat de som exact klopt. */
export function itemPrices(count: number): number[] {
  if (count <= 0) return [];
  const total = totalCents(count);
  const base = Math.floor(total / count);
  const prices = new Array<number>(count).fill(base);
  let remainder = total - base * count;
  for (let i = 0; remainder > 0; i += 1, remainder -= 1) prices[i] = prices[i]! + 1;
  return prices;
}

/** "22,50" — zonder euroteken. */
export function formatCents(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}

/** "€ 22,50" */
export function formatEuro(cents: number): string {
  return `€ ${formatCents(cents)}`;
}

/** Korte uitleg van de volgende staffelstap, of null als er niets te winnen valt. */
export function nextTierHint(count: number): string | null {
  if (count < 5) return `Nog ${5 - count} foto's tot het 5-pack (€ 4,50 per foto)`;
  if (count < 10) return `Nog ${10 - count} foto's tot het 10-pack (€ 4,00 per foto)`;
  return null;
}
