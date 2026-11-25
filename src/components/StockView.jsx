import React from 'react'
import { fmt } from '../money.js'
export default function StockView({ products, onRestock }) {
  return (
    <main className="panel"><h2>Stock</h2><table><thead><tr><th>Barcode</th><th>Item</th><th>Price</th><th>In stock</th><th /></tr></thead><tbody>
      {products.map(p => <tr key={p.code}><td>{p.code}</td><td>{p.name}</td><td>{fmt(p.price)}</td><td>{p.unit === 'g' ? p.stock / 1000 + ' kg' : p.stock}</td>
        <td><button onClick={() => onRestock(p.code)}>Restock +{p.unit === 'g' ? '10 kg' : '10'}</button></td></tr>)}</tbody></table></main>
  )
}
