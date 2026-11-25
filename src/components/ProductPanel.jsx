import React, { useState } from 'react'
import { fmt } from '../money.js'
export default function ProductPanel({ store }) {
  const [code, setCode] = useState('')
  const { products, msg, add, addByBarcode } = store
  const submit = e => { e.preventDefault(); addByBarcode(code); setCode('') }
  return (
    <section>
      <form className="scan" onSubmit={submit}>
        <input value={code} onChange={e => setCode(e.target.value)} placeholder="Scan or type barcode, press Enter" aria-label="Barcode" />
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
  )
}
