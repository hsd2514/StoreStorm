/**
 * Shop Context - Manages current shop state
 */
import { createContext, useContext, useState, useEffect } from 'react'

const ShopContext = createContext()

export function ShopProvider({ children }) {
  const [shop, setShop] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load from localStorage on mount
    const storedUser = localStorage.getItem('user')
    const storedShop = localStorage.getItem('shop')
    
    if (storedUser && storedShop) {
      setUser(JSON.parse(storedUser))
      setShop(JSON.parse(storedShop))
    }
    
    setLoading(false)
  }, [])

  const login = (userData, shopData, sessionId) => {
    setUser(userData)
    setShop(shopData)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('shop', JSON.stringify(shopData))
    if (sessionId) {
      localStorage.setItem('sessionId', sessionId)
    }
  }

  const logout = () => {
    setUser(null)
    setShop(null)
    localStorage.removeItem('user')
    localStorage.removeItem('shop')
    localStorage.removeItem('sessionId')
    localStorage.removeItem('appwrite_session') // Added for safety
  }

  const value = {
    shop,
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user && !!shop
  }

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export function useShop() {
  const context = useContext(ShopContext)
  if (!context) {
    throw new Error('useShop must be used within ShopProvider')
  }
  return context
}
