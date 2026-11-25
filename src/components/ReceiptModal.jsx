import React from 'react'
import { fmt } from '../money.js'
export default function ReceiptModal({ receipt, onClose }) {
  return (
    <div className="modal" onClick={onClose}><div className="rcpt" role="dialog" aria-label="Receipt" onClick={e => e.stopPropagation()}>
      <h3>FreshMart</h3><small>Receipt #{receipt.id} · demo</small>
      {receipt.lines.map(l => <div key={l.code}><span>{l.name} x {l.qty >= 100 && l.name.includes('per kg') ? (l.qty / 1000).toFixed(1) + ' kg' : l.qty}</span><b>{fmt(l.total)}</b></div>)}
      <hr /><div><span>Subtotal</span><b>{fmt(receipt.sub)}</b></div><div><span>Discount ({receipt.pct}%)</span><b>{fmt(-receipt.disc)}</b></div>
      <div><span>Net</span><b>{fmt(receipt.net)}</b></div><div><span>VAT 14% incl.</span><b>{fmt(receipt.vat)}</b></div>
      <div className="tot"><span>Total</span><b>{fmt(receipt.total)}</b></div><div><span>Cash</span><b>{fmt(receipt.tender)}</b></div><div><span>Change</span><b>{fmt(receipt.change)}</b></div>
      <button onClick={onClose}>Close</button></div></div>
  )
}
