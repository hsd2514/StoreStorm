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
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser)
      setShop(JSON.parse(storedShop))
      
      // Auto-sync shop data with backend on mount
      // Appwrite user in local storage has .id key from auth API
      const userId = parsedUser.id || parsedUser.$id;
      if (userId) {
        console.log('🔄 Initiating shop sync for user:', userId);
        syncShop(userId)
      }
    }
    
    setLoading(false)
  }, [])

  const syncShop = async (userId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/shops/?owner_id=${userId}`)
      const data = await response.json()
      // The API returns { total: X, shops: [...] }
      if (data && data.shops && data.shops.length > 0) {
        const syncedShop = data.shops[0];
        // Standardize id key
        if (syncedShop.$id && !syncedShop.id) syncedShop.id = syncedShop.$id;
        
        setShop(syncedShop)
        localStorage.setItem('shop', JSON.stringify(syncedShop))
        console.log('✅ Shop synchronized:', syncedShop.id)
      } else {
        console.warn('⚠️ No shop found for user during sync')
      }
    } catch (err) {
      console.error('❌ Shop sync failed:', err)
    }
  }

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
