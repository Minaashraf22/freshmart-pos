import React, { useState } from 'react'
import { useStore } from './hooks/useStore.js'
import Header from './components/Header.jsx'
import ProductPanel from './components/ProductPanel.jsx'
import CartPanel from './components/CartPanel.jsx'
import StockView from './components/StockView.jsx'
import SalesView from './components/SalesView.jsx'
import ReceiptModal from './components/ReceiptModal.jsx'

export default function App() {
  const [view, setView] = useState('sell')
  const store = useStore()
  return (
    <div className="app">
      <Header view={view} setView={setView} />
      {view === 'sell' && <main className="sell"><ProductPanel store={store} /><CartPanel store={store} /></main>}
      {view === 'stock' && <StockView products={store.products} onRestock={store.restock} />}
      {view === 'sales' && <SalesView store={store} />}
      {store.receipt && <ReceiptModal receipt={store.receipt} onClose={() => store.setReceipt(null)} />}
    </div>
  )
}
