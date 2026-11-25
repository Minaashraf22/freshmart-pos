import { useEffect, useState } from 'react'
import { seed } from '../data.js'
import { lineTotal, totals } from '../money.js'

const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
export const stepOf = p => (p.unit === 'g' ? 500 : 1)

// Catalogue, current order, held orders, payment, refunds and persistence.
export function useStore() {
  const [products, setProducts] = useState(() => load('fm-products', seed))
  const [sales, setSales] = useState(() => load('fm-sales', []))
  const [held, setHeld] = useState(() => load('fm-held', []))
  const [lines, setLines] = useState([])
  const [disc, setDisc] = useState(0)
  const [msg, setMsg] = useState('')
  const [tender, setTender] = useState('')
  const [receipt, setReceipt] = useState(null)
  useEffect(() => localStorage.setItem('fm-products', JSON.stringify(products)), [products])
  useEffect(() => localStorage.setItem('fm-sales', JSON.stringify(sales)), [sales])
  useEffect(() => localStorage.setItem('fm-held', JSON.stringify(held)), [held])

  const inCart = c => lines.find(l => l.code === c)?.qty || 0
  function add(p, qty = stepOf(p)) {
    if (inCart(p.code) + qty > p.stock) { setMsg(`Only ${p.unit === 'g' ? p.stock / 1000 + ' kg' : p.stock} of ${p.name} in stock`); return }
    setMsg('')
    setLines(ls => ls.some(l => l.code === p.code) ? ls.map(l => l.code === p.code ? { ...l, qty: l.qty + qty } : l) : [...ls, { code: p.code, qty }])
  }
  function addByBarcode(code) {
    const p = products.find(x => x.code === code.trim())
    if (!p) setMsg(`No product with barcode "${code.trim()}"`); else add(p)
  }
  const change = (c, d) => setLines(ls => ls.map(l => l.code === c ? { ...l, qty: l.qty + d } : l).filter(l => l.qty > 0))
  const t = totals(lines, products, disc)
  const tend = Math.round(parseFloat(tender || '0') * 100)

  function pay() {
    if (!lines.length) return
    if (tend < t.total) { setMsg('Cash received is less than the total'); return }
    for (const l of lines) if (products.find(p => p.code === l.code).stock < l.qty) { setMsg('Stock changed, please review the cart'); return }
    const sale = { id: sales.length + 1, at: new Date().toISOString(), lines: lines.map(l => ({ ...l, name: products.find(p => p.code === l.code).name, total: lineTotal(products.find(p => p.code === l.code), l.qty) })), ...t, tender: tend, change: tend - t.total, refunded: false }
    setProducts(ps => ps.map(p => ({ ...p, stock: p.stock - (lines.find(l => l.code === p.code)?.qty || 0) })))
    setSales(s => [...s, sale]); setReceipt(sale); setLines([]); setDisc(0); setTender(''); setMsg('')
  }
  function hold() { if (!lines.length) return; setHeld(h => [...h, { lines, disc }]); setLines([]); setDisc(0) }
  function resume(i) { if (lines.length) { setMsg('Finish or hold the current order first'); return } setLines(held[i].lines); setDisc(held[i].disc); setHeld(h => h.filter((_, j) => j !== i)) }
  function refund(id) {
    const s = sales.find(x => x.id === id); if (!s || s.refunded) return
    setProducts(ps => ps.map(p => ({ ...p, stock: p.stock + (s.lines.find(l => l.code === p.code)?.qty || 0) })))
    setSales(ss => ss.map(x => x.id === id ? { ...x, refunded: true } : x))
  }
  const restock = code => setProducts(ps => ps.map(x => x.code === code ? { ...x, stock: x.stock + (x.unit === 'g' ? 10000 : 10) } : x))
  const live = sales.filter(s => !s.refunded)
  const revenue = live.reduce((a, s) => a + s.total, 0)
  const reset = () => { setProducts(seed); setSales([]); setHeld([]); setLines([]); setReceipt(null) }
  return { products, sales, held, lines, disc, setDisc, msg, tender, setTender, receipt, setReceipt, t, tend, add, addByBarcode, change, pay, hold, resume, refund, restock, live, revenue, reset }
}
