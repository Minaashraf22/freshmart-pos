import React from 'react'
import { fmt, lineTotal } from '../money.js'
import { stepOf } from '../hooks/useStore.js'
export default function CartPanel({ store }) {
  const { products, lines, disc, setDisc, t, tend, tender, setTender, held, change, add, hold, pay, resume } = store
  return (
    <aside className="cart">
      <h2>Current order</h2>
      {!lines.length && <p className="empty">Scan an item or tap a product.</p>}
      {lines.map(l => { const p = products.find(x => x.code === l.code); return (
        <div className="line" key={l.code}><span>{p.name}</span>
          <span className="q"><button aria-label="less" onClick={() => change(l.code, -stepOf(p))}>-</button>{p.unit === 'g' ? (l.qty / 1000).toFixed(1) + ' kg' : l.qty}<button aria-label="more" onClick={() => add(p)}>+</button></span>
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
  )
}
