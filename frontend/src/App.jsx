import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Orders from './pages/Orders'
import Inventory from './pages/Inventory'
import Delivery from './pages/Delivery'
import GST from './pages/GST'
import Storefront from './pages/Storefront'
import Login from './pages/Login'
import Register from './pages/Register'
import './index.css'

// Protected Route Component
function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('user') && localStorage.getItem('shop')
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/storefront/:shopId" element={<Storefront />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
        <Route path="/delivery" element={<ProtectedRoute><Delivery /></ProtectedRoute>} />
        <Route path="/gst" element={<ProtectedRoute><GST /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
