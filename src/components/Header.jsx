import React from 'react'
export default function Header({ view, setView }) {
  return (
    <header><div className="logo"><img src="logo.svg" alt="" /><b>FreshMart</b><small>POS demo</small></div>
      <nav>{['sell', 'stock', 'sales'].map(v => <button key={v} className={view === v ? 'on' : ''} onClick={() => setView(v)}>{v}</button>)}</nav></header>
  )
}
