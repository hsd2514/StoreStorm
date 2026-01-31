import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus,
  IndianRupee,
  Store,
  Phone,
  MapPin,
  Clock,
  Star
} from 'lucide-react'
import { cn } from '../lib/utils'

const shopInfo = {
  name: 'Kumar General Store',
  rating: 4.8,
  reviews: 234,
  address: '45, 5th Cross, Koramangala, Bangalore',
  phone: '+91 98765 43210',
  hours: '7 AM - 10 PM',
  delivery: 'Free delivery above ₹500'
}

const categories = ['All', 'Grains', 'Pulses', 'Oils', 'Dairy', 'Essentials', 'Beverages']

const products = [
  { id: 1, name: 'Basmati Rice', category: 'Grains', price: 85, unit: 'kg', image: '🍚' },
  { id: 2, name: 'Toor Dal', category: 'Pulses', price: 140, unit: 'kg', image: '🫘' },
  { id: 3, name: 'Sunflower Oil', category: 'Oils', price: 180, unit: 'L', image: '🫒' },
  { id: 4, name: 'Milk', category: 'Dairy', price: 60, unit: 'L', image: '🥛' },
  { id: 5, name: 'Sugar', category: 'Essentials', price: 45, unit: 'kg', image: '🧂' },
  { id: 6, name: 'Atta', category: 'Grains', price: 38, unit: 'kg', image: '🌾' },
  { id: 7, name: 'Moong Dal', category: 'Pulses', price: 120, unit: 'kg', image: '🫛' },
  { id: 8, name: 'Groundnut Oil', category: 'Oils', price: 200, unit: 'L', image: '🥜' },
]

export default function Storefront() {
  const { shopId } = useParams()
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [cart, setCart] = useState({})
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const cartItems = Object.entries(cart).filter(([, qty]) => qty > 0)
  const cartTotal = cartItems.reduce((total, [id, qty]) => {
    const product = products.find(p => p.id === parseInt(id))
    return total + (product?.price || 0) * qty
  }, 0)
  const cartCount = cartItems.reduce((count, [, qty]) => count + qty, 0)

  const updateCart = (productId, delta) => {
    setCart(prev => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) + delta)
    }))
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 shadow-lg shadow-purple-500/25">
                <Store className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{shopInfo.name}</h1>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" aria-hidden="true" />
                  <span>{shopInfo.rating}</span>
                  <span>•</span>
                  <span>{shopInfo.reviews} reviews</span>
                </div>
              </div>
            </div>

            {/* Cart button */}
            <button className="relative flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 rounded-xl shadow-lg shadow-purple-500/25 transition-all">
              <ShoppingCart className="w-5 h-5" aria-hidden="true" />
              <span className="tabular-nums">₹{cartTotal.toLocaleString()}</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 text-xs font-bold bg-cyan-500 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Shop info */}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-zinc-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" aria-hidden="true" />
              {shopInfo.address}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" aria-hidden="true" />
              {shopInfo.hours}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-4 h-4" aria-hidden="true" />
              {shopInfo.phone}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search products…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl text-white placeholder-zinc-500 transition-colors outline-none"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-all duration-200',
                selectedCategory === category
                  ? 'bg-gradient-to-r from-purple-500/20 to-purple-500/5 text-white border border-purple-500/20'
                  : 'text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10'
              )}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => {
            const quantity = cart[product.id] || 0
            return (
              <div
                key={product.id}
                className="glass rounded-2xl p-5 hover:bg-white/[0.03] transition-colors group"
              >
                {/* Product image */}
                <div className="flex items-center justify-center w-full h-24 mb-4 text-5xl">
                  {product.image}
                </div>

                {/* Product info */}
                <h3 className="text-lg font-semibold text-white mb-1">
                  {product.name}
                </h3>
                <p className="text-sm text-zinc-500 mb-3">{product.category}</p>
                
                {/* Price and cart */}
                <div className="flex items-center justify-between">
                  <div className="text-white font-semibold flex items-center gap-0.5">
                    <IndianRupee className="w-4 h-4" aria-hidden="true" />
                    <span className="tabular-nums">{product.price}</span>
                    <span className="text-sm text-zinc-500 font-normal">/{product.unit}</span>
                  </div>

                  {quantity === 0 ? (
                    <button
                      onClick={() => updateCart(product.id, 1)}
                      className="px-4 py-2 text-sm font-medium text-purple-400 hover:text-white bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateCart(product.id, -1)}
                        className="p-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <span className="w-8 text-center text-white font-medium tabular-nums">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateCart(product.id, 1)}
                        className="p-2 text-white bg-purple-500 hover:bg-purple-400 rounded-lg transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-500 text-lg">No products found</p>
          </div>
        )}
      </main>

      {/* Floating cart bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 glass border-t border-white/10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">{cartCount} items in cart</p>
              <p className="text-xl font-bold text-white flex items-center gap-1">
                <IndianRupee className="w-5 h-5" aria-hidden="true" />
                <span className="tabular-nums">{cartTotal.toLocaleString()}</span>
              </p>
            </div>
            <button className="px-8 py-3 text-base font-medium text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 rounded-xl shadow-lg shadow-purple-500/25 transition-all hover:-translate-y-0.5 active:scale-[0.98]">
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
