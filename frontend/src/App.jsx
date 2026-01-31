import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Orders from './pages/Orders'
import Inventory from './pages/Inventory'
import Delivery from './pages/Delivery'
import GST from './pages/GST'
import Storefront from './pages/Storefront'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/delivery" element={<Delivery />} />
        <Route path="/gst" element={<GST />} />
        <Route path="/storefront/:shopId" element={<Storefront />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
