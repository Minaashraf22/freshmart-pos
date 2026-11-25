import React from 'react'
import { fmt } from '../money.js'
export default function SalesView({ store }) {
  const { sales, live, revenue, refund, reset } = store
  return (
    <main className="panel"><h2>Sales</h2>
      <div className="kpis"><div><small>Orders</small><b>{live.length}</b></div><div><small>Revenue</small><b>{fmt(revenue)}</b></div><div><small>Avg order</small><b>{live.length ? fmt(Math.round(revenue / live.length)) : '0.00'}</b></div></div>
      <table><thead><tr><th>#</th><th>Time</th><th>Items</th><th>Total</th><th /></tr></thead><tbody>
        {sales.map(s => <tr key={s.id} className={s.refunded ? 'ref' : ''}><td>{s.id}</td><td>{new Date(s.at).toLocaleTimeString()}</td><td>{s.lines.length}</td><td>{fmt(s.total)}</td>
          <td>{s.refunded ? 'Refunded' : <button onClick={() => refund(s.id)}>Refund</button>}</td></tr>)}</tbody></table>
      <button className="ghost" onClick={reset}>Reset demo data</button></main>
  )
}
