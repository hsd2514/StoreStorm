import { useState, useEffect, useRef } from 'react'
import { 
  Search, 
  Bell, 
  Command, 
  X, 
  Package, 
  ShoppingCart, 
  User, 
  ArrowRight,
  Loader2,
  Clock,
  Sparkles,
  Info
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { productService } from '../../services/productService'
import { orderService } from '../../services/orderService'
import { customerService } from '../../services/customerService'
import { useShop } from '../../context/ShopContext'
import { cn } from '../../lib/utils'

export default function TopBar() {
  const { shop } = useShop()
  const navigate = useNavigate()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState({ products: [], orders: [], customers: [] })
  const [isSearching, setIsSearching] = useState(false)
  const searchRef = useRef(null)
  const notifRef = useRef(null)

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard shortcut CMD+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 1 && shop?.id) {
        setIsSearching(true)
        try {
          const [products, orders, customers] = await Promise.all([
            productService.list({ shop_id: shop.id }).then(res => res.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)),
            orderService.list({ shop_id: shop.id }).then(res => res.filter(o => o.order_number.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)),
            customerService.list({ shop_id: shop.id }).then(res => res.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3))
          ])
          setResults({ products, orders, customers })
        } catch (err) {
          console.error('Search failed:', err)
        } finally {
          setIsSearching(false)
        }
      } else {
        setResults({ products: [], orders: [], customers: [] })
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery, shop?.id])

  const handleSelect = (type, id) => {
    setIsSearchOpen(false)
    setSearchQuery('')
    if (type === 'product') navigate('/inventory')
    if (type === 'order') navigate('/orders')
    if (type === 'customer') navigate('/customers')
  }

  // Mock notifications
  const notifications = [
    { id: 1, title: 'New Order Received', desc: 'Order #ORD-8271 from Sarah J.', time: '2 mins ago', type: 'order', unread: true },
    { id: 2, title: 'Stock Alert', desc: 'Organic Honey is running low (5 left)', time: '1 hour ago', type: 'alert', unread: true },
    { id: 3, title: 'Weekly Insight Ready', desc: 'Your sales digest for this week is generated.', time: '5 hours ago', type: 'insight', unread: false },
  ]

  return (
    <header className="sticky top-0 z-[60] flex items-center justify-between h-20 px-8 glass border-b border-white/5 backdrop-blur-xl">
      {/* Search Trigger */}
      <div className="flex-1 max-w-lg">
        <button 
          onClick={() => setIsSearchOpen(true)}
          aria-label="Search items"
          className="flex items-center w-full gap-4 px-5 py-3 text-sm text-zinc-400 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 rounded-2xl transition-[background-color,border-color] group"
        >
          <Search className="w-4 h-4 text-zinc-500 group-hover:text-purple-400 transition-colors" />
          <span className="font-medium italic opacity-60">Search for orders, products or customers...</span>
          <kbd className="ml-auto flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black bg-white/5 border border-white/10 rounded-lg text-zinc-500 uppercase tracking-widest">
            <Command className="w-3 h-3" />
            K
          </kbd>
        </button>
      </div>

      {/* Right side Actions */}
      <div className="flex items-center gap-6">
        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            aria-label="Toggle notifications"
            className={cn(
              "relative p-3.5 rounded-2xl transition-[background-color,border-color] border",
              isNotifOpen ? "bg-purple-500/10 border-purple-500/20 text-purple-400" : "text-zinc-400 hover:text-white bg-white/5 border-transparent hover:border-white/10"
            )}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full ring-4 ring-[#0a0a0f]" />
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-4 w-[380px] glass rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Feed</h3>
                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] font-black rounded-full italic">3 New</span>
              </div>
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.map(n => (
                  <div key={n.id} className={cn(
                    "p-5 hover:bg-white/[0.04] transition-colors cursor-pointer border-b border-white/5 last:border-0 relative group",
                    n.unread && "bg-white/[0.01]"
                  )}>
                    {n.unread && <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500" />}
                    <div className="flex gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                        n.type === 'order' ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : 
                        n.type === 'alert' ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : 
                        "bg-purple-500/10 border-purple-500/20 text-purple-400"
                      )}>
                        {n.type === 'order' ? <ShoppingCart className="w-5 h-5" /> : 
                         n.type === 'alert' ? <Package className="w-5 h-5" /> : 
                         <Sparkles className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors uppercase tracking-tight">{n.title}</p>
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{n.desc}</p>
                        <div className="flex items-center gap-2 mt-2">
                           <Clock className="w-3 h-3 text-zinc-600" />
                           <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{n.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full py-4 text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-[0.2em] bg-white/[0.01] hover:bg-white/[0.03] transition-colors border-t border-white/5">
                Clear all notifications
              </button>
            </div>
          )}
        </div>

        {/* Global Action */}
        <button 
          onClick={() => navigate('/orders')}
          className="flex items-center gap-2.5 px-5 py-3 text-xs font-black text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 rounded-2xl shadow-xl shadow-purple-500/25 transition-all hover:-translate-y-0.5 active:scale-[0.98] uppercase tracking-widest"
        >
          <Sparkles className="w-4 h-4" />
          Quick Order
        </button>
      </div>

      {/* Global Search Palette Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                autoFocus
                type="text"
                aria-label="Global search"
                placeholder="Type to search anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-16 py-6 bg-white/[0.02] text-xl font-bold text-white outline-none placeholder:text-zinc-600 border-b border-white/5"
              />
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-2 hover:bg-white/5 rounded-xl text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
               {isSearching ? (
                 <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                    <p className="text-xs font-black text-zinc-600 uppercase tracking-[0.3em] italic">Scanning Database...</p>
                 </div>
               ) : searchQuery.length < 2 ? (
                 <div className="py-12 flex flex-col items-center text-center px-10">
                    <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-zinc-700 mb-6">
                       <Command className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-black text-white italic mb-2">OmniSearch v1.0</h4>
                    <p className="text-xs font-bold text-zinc-500 leading-relaxed uppercase tracking-widest">Type at least 2 characters to search across <span className="text-purple-400">Products</span>, <span className="text-blue-400">Orders</span>, and <span className="text-emerald-400">Customers</span>.</p>
                 </div>
               ) : (
                 <div className="space-y-6 p-2">
                    {/* Products section */}
                    {results.products.length > 0 && (
                      <div className="space-y-2">
                         <h5 className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-2 mb-3">
                            <Package className="w-3.5 h-3.5" /> Items ({results.products.length})
                         </h5>
                         {results.products.map(p => (
                           <button 
                             key={p.id} 
                             onClick={() => handleSelect('product', p.id)}
                             className="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl group transition-all text-left"
                           >
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
                                   <Package className="w-5 h-5" />
                                </div>
                                <div>
                                   <p className="text-sm font-bold text-white uppercase tracking-tight">{p.name}</p>
                                   <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">₹{p.price} • {p.stock} in stock</p>
                                </div>
                              </div>
                              <ArrowRight className="w-4 h-4 text-zinc-800 group-hover:text-white group-hover:translate-x-1 transition-all" />
                           </button>
                         ))}
                      </div>
                    )}

                    {/* Orders section */}
                    {results.orders.length > 0 && (
                      <div className="space-y-2">
                         <h5 className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-2 mb-3">
                            <ShoppingCart className="w-3.5 h-3.5" /> Shipments ({results.orders.length})
                         </h5>
                         {results.orders.map(o => (
                           <button 
                             key={o.id} 
                             onClick={() => handleSelect('order', o.id)}
                             className="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl group transition-all text-left"
                           >
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                   <ShoppingCart className="w-5 h-5" />
                                </div>
                                <div>
                                   <p className="text-sm font-bold text-white uppercase tracking-tight">{o.order_number}</p>
                                   <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Total ₹{o.total_amount} • {o.status}</p>
                                </div>
                              </div>
                              <ArrowRight className="w-4 h-4 text-zinc-800 group-hover:text-white group-hover:translate-x-1 transition-all" />
                           </button>
                         ))}
                      </div>
                    )}

                    {/* Customers section */}
                    {results.customers.length > 0 && (
                      <div className="space-y-2">
                         <h5 className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-2 mb-3">
                            <User className="w-3.5 h-3.5" /> Contacts ({results.customers.length})
                         </h5>
                         {results.customers.map(c => (
                           <button 
                             key={c.id} 
                             onClick={() => handleSelect('customer', c.id)}
                             className="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl group transition-all text-left"
                           >
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                   <User className="w-5 h-5" />
                                </div>
                                <div>
                                   <p className="text-sm font-bold text-white uppercase tracking-tight">{c.name}</p>
                                   <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{c.phone}</p>
                                </div>
                              </div>
                              <ArrowRight className="w-4 h-4 text-zinc-800 group-hover:text-white group-hover:translate-x-1 transition-all" />
                           </button>
                         ))}
                      </div>
                    )}

                    {results.products.length === 0 && results.orders.length === 0 && results.customers.length === 0 && (
                      <div className="py-20 flex flex-col items-center text-center">
                         <Info className="w-12 h-12 text-zinc-800 mb-4" />
                         <p className="text-sm font-black text-zinc-500 uppercase tracking-widest">No matching results found</p>
                      </div>
                    )}
                 </div>
               )}
            </div>

            <div className="px-8 py-5 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
               <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                     <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] font-black text-zinc-500">ESC</kbd>
                     <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Close</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] font-black text-zinc-500">↵</kbd>
                     <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Select</span>
                  </div>
               </div>
               <p className="text-[10px] font-black text-purple-400 italic">StoreStorm Search</p>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
