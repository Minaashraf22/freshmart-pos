import React, { useEffect, useRef, useState } from 'react'
import { seed } from './data.js'
import { fmt, lineTotal, totals } from './money.js'

const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }

export default function App() {
  const [products, setProducts] = useState(() => load('fm-products', seed))
  const [sales, setSales] = useState(() => load('fm-sales', []))
  const [held, setHeld] = useState(() => load('fm-held', []))
  const [lines, setLines] = useState([])
  const [disc, setDisc] = useState(0)
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState('')
  const [tender, setTender] = useState('')
  const [receipt, setReceipt] = useState(null)
  const [view, setView] = useState('sell')
  const scan = useRef()

  useEffect(() => localStorage.setItem('fm-products', JSON.stringify(products)), [products])
  useEffect(() => localStorage.setItem('fm-sales', JSON.stringify(sales)), [sales])
  useEffect(() => localStorage.setItem('fm-held', JSON.stringify(held)), [held])

  const inCart = c => lines.find(l => l.code === c)?.qty || 0
  const step = p => (p.unit === 'g' ? 500 : 1)
  function add(p, qty = step(p)) {
    if (inCart(p.code) + qty > p.stock) { setMsg(`Only ${p.unit === 'g' ? p.stock / 1000 + ' kg' : p.stock} of ${p.name} in stock`); return }
    setMsg('')
    setLines(ls => ls.some(l => l.code === p.code) ? ls.map(l => l.code === p.code ? { ...l, qty: l.qty + qty } : l) : [...ls, { code: p.code, qty }])
  }
  function scanSubmit(e) {
    e.preventDefault()
    const p = products.find(x => x.code === code.trim())
    if (!p) setMsg(`No product with barcode "${code.trim()}"`); else add(p)
    setCode('')
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
  const live = sales.filter(s => !s.refunded)
  const revenue = live.reduce((a, s) => a + s.total, 0)
  const reset = () => { setProducts(seed); setSales([]); setHeld([]); setLines([]); setReceipt(null) }

  return (
    <div className="app">
      <header><div className="logo"><img src="logo.svg" alt="" /><b>FreshMart</b><small>POS demo</small></div>
        <nav>{['sell', 'stock', 'sales'].map(v => <button key={v} className={view === v ? 'on' : ''} onClick={() => setView(v)}>{v}</button>)}</nav></header>

      {view === 'sell' && <main className="sell">
        <section>
          <form className="scan" onSubmit={scanSubmit}>
            <input ref={scan} value={code} onChange={e => setCode(e.target.value)} placeholder="Scan or type barcode, press Enter" aria-label="Barcode" />
            <button>Add</button>
          </form>
          {msg && <p className="msg" role="alert">{msg}</p>}
          <div className="products">{products.map(p => (
            <button key={p.code} className="prod" onClick={() => add(p)} disabled={p.stock <= 0}>
              <img src={p.img} alt="" /><b>{p.name}</b>
              <span>{fmt(p.price)} EGP{p.unit === 'g' ? ' / kg' : ''}</span>
              <small className={p.stock <= (p.unit === 'g' ? 5000 : 10) ? 'low' : ''}>{p.stock <= 0 ? 'Out of stock' : p.unit === 'g' ? (p.stock / 1000) + ' kg left' : p.stock + ' left'}</small>
            </button>))}</div>
        </section>
        <aside className="cart">
          <h2>Current order</h2>
          {!lines.length && <p className="empty">Scan an item or tap a product.</p>}
          {lines.map(l => { const p = products.find(x => x.code === l.code); return (
            <div className="line" key={l.code}><span>{p.name}</span>
              <span className="q"><button aria-label="less" onClick={() => change(l.code, -step(p))}>-</button>{p.unit === 'g' ? (l.qty / 1000).toFixed(1) + ' kg' : l.qty}<button aria-label="more" onClick={() => add(p)}>+</button></span>
              <b>{fmt(lineTotal(p, l.qty))}</b></div>) })}
          <label className="row">Discount %<input type="number" min="0" max="100" value={disc} onChange={e => setDisc(Math.min(100, Math.max(0, Number(e.target.value) || 0)))} /></label>
          <div className="sum">
            <div><span>Subtotal</span><b>{fmt(t.sub)}</b></div>
            <div><span>Discount ({t.pct}%)</span><b>{fmt(-t.disc)}</b></div>
            <div><span>Net (before VAT)</span><b>{fmt(t.net)}</b></div>
            <div><span>VAT 14% (included)</span><b>{fmt(t.vat)}</b></div>
            <div className="tot"><span>Total</span><b data-testid="total">{fmt(t.total)} EGP</b></div>
          </div>
          <label className="row">Cash received<input type="number" min="0" step="0.01" value={tender} onChange={e => setTender(e.target.value)} /></label>
          <div className="chg">Change: <b>{tend >= t.total && lines.length ? fmt(tend - t.total) : '0.00'}</b></div>
          <div className="btns"><button className="ghost" onClick={hold}>Hold</button><button className="pay" onClick={pay}>Pay</button></div>
          {held.length > 0 && <div className="held"><small>Held orders</small>{held.map((h, i) => <button key={i} onClick={() => resume(i)}>Resume #{i + 1} ({h.lines.length} items)</button>)}</div>}
        </aside>
      </main>}

      {view === 'stock' && <main className="panel"><h2>Stock</h2><table><thead><tr><th>Barcode</th><th>Item</th><th>Price</th><th>In stock</th><th /></tr></thead><tbody>
        {products.map(p => <tr key={p.code}><td>{p.code}</td><td>{p.name}</td><td>{fmt(p.price)}</td><td>{p.unit === 'g' ? p.stock / 1000 + ' kg' : p.stock}</td>
          <td><button onClick={() => setProducts(ps => ps.map(x => x.code === p.code ? { ...x, stock: x.stock + (x.unit === 'g' ? 10000 : 10) } : x))}>Restock +{p.unit === 'g' ? '10 kg' : '10'}</button></td></tr>)}</tbody></table></main>}

      {view === 'sales' && <main className="panel"><h2>Sales</h2>
        <div className="kpis"><div><small>Orders</small><b>{live.length}</b></div><div><small>Revenue</small><b>{fmt(revenue)}</b></div><div><small>Avg order</small><b>{live.length ? fmt(Math.round(revenue / live.length)) : '0.00'}</b></div></div>
        <table><thead><tr><th>#</th><th>Time</th><th>Items</th><th>Total</th><th /></tr></thead><tbody>
          {sales.map(s => <tr key={s.id} className={s.refunded ? 'ref' : ''}><td>{s.id}</td><td>{new Date(s.at).toLocaleTimeString()}</td><td>{s.lines.length}</td><td>{fmt(s.total)}</td>
            <td>{s.refunded ? 'Refunded' : <button onClick={() => refund(s.id)}>Refund</button>}</td></tr>)}</tbody></table>
        <button className="ghost" onClick={reset}>Reset demo data</button></main>}

      {receipt && <div className="modal" onClick={() => setReceipt(null)}><div className="rcpt" role="dialog" aria-label="Receipt" onClick={e => e.stopPropagation()}>
        <h3>FreshMart</h3><small>Receipt #{receipt.id} · demo</small>
        {receipt.lines.map(l => <div key={l.code}><span>{l.name} x {l.qty >= 100 && l.name.includes('per kg') ? (l.qty / 1000).toFixed(1) + ' kg' : l.qty}</span><b>{fmt(l.total)}</b></div>)}
        <hr /><div><span>Subtotal</span><b>{fmt(receipt.sub)}</b></div><div><span>Discount ({receipt.pct}%)</span><b>{fmt(-receipt.disc)}</b></div>
        <div><span>Net</span><b>{fmt(receipt.net)}</b></div><div><span>VAT 14% incl.</span><b>{fmt(receipt.vat)}</b></div>
        <div className="tot"><span>Total</span><b>{fmt(receipt.total)}</b></div><div><span>Cash</span><b>{fmt(receipt.tender)}</b></div><div><span>Change</span><b>{fmt(receipt.change)}</b></div>
        <button onClick={() => setReceipt(null)}>Close</button></div></div>}
    </div>
  )
}
