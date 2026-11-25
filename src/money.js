export const fmt = c => (c < 0 ? '-' : '') + (Math.abs(c) / 100).toFixed(2)
// line total: pieces => price*qty ; weight items => price per kg * grams/1000, rounded to the piastre
export const lineTotal = (p, qty) => p.unit === 'g' ? Math.round(p.price * qty / 1000) : p.price * qty
export function totals(lines, products, discountPct) {
  const sub = lines.reduce((s, l) => s + lineTotal(products.find(p => p.code === l.code), l.qty), 0)
  const pct = Math.min(100, Math.max(0, Number(discountPct) || 0))
  const disc = Math.round(sub * pct / 100)
  const total = sub - disc
  const vat = total - Math.round(total / 1.14) // VAT contained in the total
  return { sub, pct, disc, total, vat, net: total - vat }
}
