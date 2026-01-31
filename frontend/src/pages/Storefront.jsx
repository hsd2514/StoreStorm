import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
  Star,
  Loader2,
  CheckCircle2,
  X,
  AlertCircle
} from 'lucide-react'
import { cn } from '../lib/utils'
import { shopService } from '../services/shopService'
import { productService } from '../services/productService'
import { customerService } from '../services/customerService'
import { orderService } from '../services/orderService'

export default function Storefront() {
  const { shopId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [shop, setShop] = useState(null)
  const [products, setProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [cart, setCart] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    if (shopId) {
      fetchShopData()
    }
  }, [shopId])

  const fetchShopData = async () => {
    try {
      setLoading(true)
      const [shopData, productsData] = await Promise.all([
        shopService.get(shopId),
        productService.list({ shop_id: shopId })
      ])
      setShop(shopData)
      setProducts(productsData)
    } catch (err) {
      console.error('Failed to fetch shop data:', err)
      setError('This shop is currently unavailable')
    } finally {
      setLoading(false)
    }
  }

  const categories = ['All', ...new Set(products.map(p => p.category))]

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const cartItems = Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => {
      const product = products.find(p => p.id === id)
      return { ...product, quantity: qty }
    })

  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  const cartGst = cartItems.reduce((total, item) => total + (item.price * item.quantity * (item.gst_rate / 100)), 0)
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0)

  const updateCart = (productId, delta) => {
    setCart(prev => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) + delta)
    }))
  }

  const handleCheckout = async (customerDetails) => {
    try {
      setLoading(true)
      // 1. Create or Find Customer
      const customers = await customerService.list({ phone: customerDetails.phone, shop_id: shopId })
      let customer = customers.find(c => c.phone === customerDetails.phone)
      
      if (!customer) {
        customer = await customerService.create({
          ...customerDetails,
          shop_id: shopId
        })
      }

      // 2. Create Order
      const orderData = {
        shop_id: shopId,
        customer_id: customer.id,
        order_number: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        source: 'storefront',
        items: cartItems.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price,
          total: item.price * item.quantity
        })),
        total_amount: cartTotal + cartGst,
        gst_amount: cartGst,
        status: 'pending',
        delivery_address: customerDetails.address,
        notes: customerDetails.notes
      }

      await orderService.create(orderData)
      setIsSuccess(true)
      setCart({})
    } catch (err) {
      console.error('Checkout failed:', err)
      alert('Checkout failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !shop) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center text-white p-4">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
        <p className="text-zinc-400">Opening store details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center text-white p-4 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
        <h1 className="text-2xl font-bold mb-2">Store Not Found</h1>
        <p className="text-zinc-400 mb-8 max-w-md">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
        >
          Try Again
        </button>
      </div>
    )
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
                <h1 className="text-xl font-bold text-white">{shop.name}</h1>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" aria-hidden="true" />
                  <span>4.8</span>
                  <span>•</span>
                  <span>{shop.category}</span>
                </div>
              </div>
            </div>

            {/* Cart button */}
            <button 
              onClick={() => setIsCheckoutOpen(true)}
              className="relative flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 rounded-xl shadow-lg shadow-purple-500/25 transition-all"
            >
              <ShoppingCart className="w-5 h-5" aria-hidden="true" />
              <span className="tabular-nums">₹{(cartTotal + cartGst).toLocaleString()}</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 text-xs font-bold bg-cyan-500 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-zinc-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" aria-hidden="true" />
              {shop.address}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-4 h-4" aria-hidden="true" />
              {shop.phone}
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
                <div className="flex items-center justify-center w-full h-24 mb-4 text-5xl bg-white/5 rounded-xl">
                  {/* Category based emojis if image missing */}
                  {product.category === 'Grains' ? '🍚' : 
                   product.category === 'Dairy' ? '🥛' : 
                   product.category === 'Oils' ? '🫒' : '📦'}
                </div>

                <h3 className="text-lg font-semibold text-white mb-1">
                  {product.name}
                </h3>
                <p className="text-sm text-zinc-500 mb-3">{product.category}</p>
                
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
          <div className="text-center py-20">
            <ShoppingCart className="w-16 h-16 text-zinc-800 mx-auto mb-4" />
            <p className="text-zinc-500 text-lg italic">No products matched your search</p>
          </div>
        )}
      </main>

      {/* Floating cart bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 glass border-t border-white/10 animate-in slide-in-from-bottom duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">{cartCount} items in cart</p>
              <p className="text-xl font-bold text-white flex items-center gap-1">
                <IndianRupee className="w-5 h-5" aria-hidden="true" />
                <span className="tabular-nums">{(cartTotal + cartGst).toLocaleString()}</span>
              </p>
            </div>
            <button 
              onClick={() => setIsCheckoutOpen(true)}
              className="px-8 py-3 text-base font-medium text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 rounded-xl shadow-lg shadow-purple-500/25 transition-all hover:-translate-y-0.5"
            >
              Checkout
            </button>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {isSuccess ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Order Placed!</h2>
                <p className="text-zinc-400 mb-8">Your order has been sent to the shopkeeper. They will contact you shortly.</p>
                <button 
                  onClick={() => setIsCheckoutOpen(false)}
                  className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold transition-all"
                >
                  Return to Store
                </button>
              </div>
            ) : (
              <>
                <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-purple-400" />
                    Complete Your Order
                  </h3>
                  <button 
                    onClick={() => setIsCheckoutOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-xl text-zinc-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <form 
                  onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.target)
                    handleCheckout(Object.fromEntries(formData))
                  }}
                  className="p-8 space-y-6"
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Your Name</label>
                      <input 
                        name="name"
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-500 outline-none transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Phone Number</label>
                      <input 
                        name="phone"
                        type="tel"
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-500 outline-none transition-all"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Delivery Address</label>
                      <textarea 
                        name="address"
                        required
                        rows="2"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-500 outline-none transition-all resize-none"
                        placeholder="Full delivery address"
                      />
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-4 space-y-2">
                    <div className="flex justify-between text-sm text-zinc-400">
                      <span>Subtotal</span>
                      <span>₹{cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-zinc-400">
                      <span>GST (calculated)</span>
                      <span>₹{cartGst.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-white pt-2 border-t border-white/10">
                      <span>Total</span>
                      <span>₹{(cartTotal + cartGst).toLocaleString()}</span>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-2xl font-bold shadow-xl shadow-purple-500/25 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Confirm Order'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
