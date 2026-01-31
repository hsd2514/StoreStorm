import { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Plus,
  Package,
  Clock,
  CheckCircle,
  Truck,
  IndianRupee,
  MoreVertical,
  MessageSquare,
  Loader2,
  ChevronDown,
  X,
  MapPin,
  Phone,
  User,
  Calendar,
  AlertCircle,
  Trash2,
  ShoppingCart,
  ChevronRight,
  Minus
} from 'lucide-react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import DashboardLayout from '../components/layout/DashboardLayout'
import { cn } from '../lib/utils'
import { orderService } from '../services/orderService'
import { customerService } from '../services/customerService'
import { productService } from '../services/productService'
import { useShop } from '../context/ShopContext'

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-green-500/10 text-green-400 border-green-500/20', icon: CheckCircle },
  preparing: { label: 'Preparing', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Package },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: ChevronDown }
}

export default function Orders() {
  const { shop } = useShop()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [error, setError] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  
  // Create Order Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])

  const fetchOrders = async () => {
    if (!shop?.id) return
    try {
      setLoading(true)
      const filters = { shop_id: shop.id }
      if (statusFilter !== 'all') {
        filters.status = statusFilter
      }
      const fetchedOrders = await orderService.list(filters)
      setOrders(fetchedOrders)
    } catch (err) {
      console.error('Failed to fetch orders:', err)
      setError('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [shop?.id, statusFilter])

  const loadResources = async () => {
    if (!shop?.id) return
    try {
      const [featCustomers, featProducts] = await Promise.all([
        customerService.list({ shop_id: shop.id }),
        productService.list({ shop_id: shop.id })
      ])
      setCustomers(featCustomers)
      setProducts(featProducts)
    } catch (err) {
      console.error('Failed to load resources:', err)
    }
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderService.updateStatus(orderId, newStatus)
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus })
      }
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }

  // Create Order Formik
  const orderFormik = useFormik({
    initialValues: {
      customer_id: '',
      items: [], // { product_id, product_name, quantity, unit, price, total }
      delivery_address: '',
      notes: '',
      source: 'storefront'
    },
    validationSchema: Yup.object({
      customer_id: Yup.string().required('Customer is required'),
      items: Yup.array().min(1, 'Add at least one item').required('Required'),
      delivery_address: Yup.string().required('Delivery address is required'),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true)
        const subtotal = values.items.reduce((acc, item) => acc + item.total, 0)
        const gst_amount = values.items.reduce((acc, item) => {
          const p = products.find(prod => prod.id === item.product_id)
          return acc + (item.total * (p?.gst_rate || 0) / 100)
        }, 0)

        const orderData = {
          ...values,
          shop_id: shop.id,
          order_number: `ORD-${Date.now().toString().slice(-6)}`,
          total_amount: subtotal + gst_amount,
          gst_amount: gst_amount,
          status: 'pending',
          source: 'storefront'
        }

        await orderService.create(orderData)
        setIsCreateOpen(false)
        orderFormik.resetForm()
        fetchOrders()
      } catch (err) {
        console.error('Order creation failed:', err)
        setError('Failed to create order')
      } finally {
        setLoading(false)
      }
    }
  })

  const addItemToOrder = (product) => {
    const existingIndex = orderFormik.values.items.findIndex(i => i.product_id === product.id)
    if (existingIndex > -1) {
      const newItems = [...orderFormik.values.items]
      newItems[existingIndex].quantity += 1
      newItems[existingIndex].total = newItems[existingIndex].quantity * newItems[existingIndex].price
      orderFormik.setFieldValue('items', newItems)
    } else {
      const newItem = {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        unit: product.unit,
        price: product.price,
        total: product.price
      }
      orderFormik.setFieldValue('items', [...orderFormik.values.items, newItem])
    }
  }

  const removeItemFromOrder = (productId) => {
    const newItems = orderFormik.values.items.filter(i => i.product_id !== productId)
    orderFormik.setFieldValue('items', newItems)
  }

  const updateItemQuantity = (productId, delta) => {
    const newItems = orderFormik.values.items.map(item => {
      if (item.product_id === productId) {
        const newQty = Math.max(1, item.quantity + delta)
        return {
          ...item,
          quantity: newQty,
          total: newQty * item.price
        }
      }
      return item
    })
    orderFormik.setFieldValue('items', newItems)
  }

  const calculateGrandTotal = () => {
    const subtotal = orderFormik.values.items.reduce((acc, item) => acc + item.total, 0)
    const gst = orderFormik.values.items.reduce((acc, item) => {
      const p = products.find(prod => prod.id === item.product_id)
      return acc + (item.total * (p?.gst_rate || 0) / 100)
    }, 0)
    return subtotal + gst
  }

  const filteredOrders = orders.filter(o => 
    o.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customer_id?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Orders</h1>
          <p className="mt-1 text-zinc-400">Manage and track all incoming orders</p>
        </div>
        <button 
          onClick={() => {
            setIsCreateOpen(true)
            loadResources()
          }}
          className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 rounded-2xl shadow-lg shadow-purple-500/25 transition-all active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          Create New Order
        </button>
      </div>

      {/* Filters & Status Tabs */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
        <div className="w-full md:flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="search"
              placeholder="Search by order ID or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-2xl text-white transition-all outline-none"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {['all', 'pending', 'confirmed', 'preparing', 'delivered'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'px-4 py-2 text-xs font-black rounded-xl whitespace-nowrap transition-all border uppercase tracking-widest',
                statusFilter === status
                  ? 'bg-purple-500/20 text-purple-400 border-purple-500/20'
                  : 'text-zinc-500 hover:text-white hover:bg-white/5 border-transparent'
              )}
            >
              {status === 'all' ? 'All' : statusConfig[status]?.label || status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 gap-4 min-h-[400px]">
        {loading && orders.length === 0 ? (
          <div className="flex items-center justify-center h-[400px]">
             <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] glass rounded-[3rem] border border-white/5 bg-white/[0.02]">
            <ShoppingCart className="w-16 h-16 text-zinc-800 mb-4 opacity-20" />
            <p className="text-zinc-500 text-lg font-medium italic">No orders in this category</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className="glass rounded-[2rem] p-6 hover:bg-white/[0.04] transition-all cursor-pointer border border-white/5 group relative overflow-hidden"
            >
              {/* Decorative side accent */}
              <div className={cn("absolute left-0 top-0 bottom-0 w-1.5 opacity-40", 
                 order.status === 'pending' ? 'bg-amber-500' : 
                 order.status === 'delivered' ? 'bg-emerald-500' : 'bg-purple-500'
              )} />

              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/10 text-purple-400 border border-purple-500/10 shadow-inner">
                    <Package className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="flex items-center flex-wrap gap-3">
                      <h3 className="text-2xl font-black text-white group-hover:text-purple-400 transition-colors tabular-nums">{order.order_number}</h3>
                      <span className={cn(
                        'px-3 py-1 text-[10px] font-black rounded-full border uppercase tracking-widest',
                        statusConfig[order.status]?.color
                      )}>
                        {statusConfig[order.status]?.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
                       <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{new Date(order.created_at).toLocaleDateString()}</span>
                       <span className="opacity-20">|</span>
                       <span className="flex items-center gap-1.5 text-purple-400/80"><ShoppingCart className="w-3.5 h-3.5" />{order.source}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                   <div className="text-3xl font-black text-white flex items-center gap-1 leading-none tabular-nums">
                      <IndianRupee className="w-6 h-6 text-emerald-400" />
                      {order.total_amount.toLocaleString()}
                   </div>
                   <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest group-hover:text-purple-400 transition-colors">
                      View details <ChevronRight className="w-4 h-4" />
                   </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Details Modal (Existing) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div>
                <h3 className="text-3xl font-black text-white mb-1 tabular-nums tracking-tight">{selectedOrder.order_number}</h3>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Received via {selectedOrder.source} • {new Date(selectedOrder.created_at).toLocaleString()}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-4 hover:bg-white/10 rounded-2xl text-zinc-400 hover:text-white transition-all shadow-lg"
              >
                <X className="w-7 h-7" />
              </button>
            </div>

            <div className="p-10 space-y-10 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {/* Status Section */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-8 bg-white/[0.03] rounded-[2rem] border border-white/5">
                <div className="flex items-center gap-5">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border", statusConfig[selectedOrder.status]?.color)}>
                     <Package className="w-7 h-7" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 opacity-60">Workflow stage</label>
                    <p className="text-xl font-black text-white uppercase tracking-tight">{statusConfig[selectedOrder.status]?.label}</p>
                  </div>
                </div>
                <div className="relative min-w-[180px]">
                  <select 
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value)}
                    className="w-full pl-5 pr-10 py-3.5 bg-[#1a1a1f] border border-white/10 rounded-2xl text-sm font-bold text-white focus:border-purple-500 outline-none appearance-none cursor-pointer hover:bg-zinc-900 transition-colors"
                  >
                    {Object.keys(statusConfig).map(status => (
                      <option key={status} value={status}>{statusConfig[status].label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                </div>
              </div>

              {/* Grid: Items & Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Items */}
                <div className="space-y-5">
                  <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Market Basket
                  </h4>
                  <div className="space-y-4">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-[1.5rem] group hover:bg-white/[0.04] transition-colors">
                         <div>
                           <p className="font-bold text-white group-hover:text-purple-400 transition-colors uppercase tracking-tight text-sm">{item.product_name}</p>
                           <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">{item.quantity} {item.unit} @ ₹{item.price}</p>
                         </div>
                         <p className="font-black text-white tabular-nums">₹{item.total}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Info */}
                <div className="space-y-8">
                  <div className="glass rounded-[1.5rem] p-6 border border-white/5 bg-white/[0.01]">
                    <h4 className="text-xs font-black text-zinc-300/40 uppercase tracking-widest mb-6">Dispatch Details</h4>
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/10">
                            <User className="w-5 h-5" />
                         </div>
                         <div className="flex-1 overflow-hidden">
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">Recipient ID</p>
                            <p className="font-bold text-white truncate">{selectedOrder.customer_id}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/10">
                            <MapPin className="w-5 h-5" />
                         </div>
                         <div className="flex-1">
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">Delivery destination</p>
                            <p className="text-xs font-bold text-zinc-400 leading-relaxed uppercase tracking-tighter">
                               {selectedOrder.delivery_address || 'Collection point only'}
                            </p>
                         </div>
                      </div>
                    </div>
                  </div>
                  
                  {selectedOrder.notes && (
                    <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-[1.5rem] flex items-start gap-3">
                       <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                       <div className="flex-1 overflow-hidden">
                          <label className="block text-[10px] font-black text-amber-500/60 uppercase tracking-widest mb-1.5">Owner's Note</label>
                          <p className="text-sm text-amber-200/80 italic font-medium leading-relaxed truncate-2-lines">"{selectedOrder.notes}"</p>
                       </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Total Calculation */}
              <div className="border-t border-white/5 pt-10 space-y-3">
                 <div className="flex justify-between text-xs font-bold text-zinc-500 uppercase tracking-widest px-4">
                    <span>Subtotal Calculation</span>
                    <span className="tabular-nums">₹{(selectedOrder.total_amount - (selectedOrder.gst_amount || 0)).toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between text-xs font-bold text-zinc-500 uppercase tracking-widest px-4">
                    <span>GST (Tax Compliance)</span>
                    <span className="text-emerald-400 tabular-nums font-black">+ ₹{(selectedOrder.gst_amount || 0).toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-end px-4 pt-6">
                    <div>
                       <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] block mb-1">Final Payable Amount</span>
                       <span className="text-4xl font-black text-white tabular-nums tracking-tighter">
                         ₹{selectedOrder.total_amount.toLocaleString()}
                       </span>
                    </div>
                    <div className="px-5 py-2 rounded-xl bg-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-widest border border-purple-500/20">
                      Paid in full
                    </div>
                 </div>
              </div>
            </div>

            <div className="p-10 bg-white/5 border-t border-white/5 flex gap-4">
               <button className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest border border-white/10 transition-all flex items-center justify-center gap-3">
                  <MessageSquare className="w-5 h-5" />
                  Settle Chat
               </button>
               <button className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-1 transition-all">
                  Export PDF Invoice
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Order Creation Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="glass w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[90vh]">
            
            {/* Sidebar: Product Selection */}
            <div className="w-full md:w-96 border-r border-white/5 flex flex-col bg-white/[0.01]">
               <div className="px-8 py-6 border-b border-white/5">
                  <h3 className="text-xl font-black text-white mb-4">Quick Add Items</h3>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Find products..."
                      className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold text-white focus:border-purple-500 outline-none"
                    />
                  </div>
               </div>
               <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                  {products.map(p => (
                    <button
                      key={p.id}
                      onClick={() => addItemToOrder(p)}
                      className="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl group transition-all"
                    >
                       <div className="text-left">
                          <p className="text-sm font-bold text-white group-hover:text-purple-400">{p.name}</p>
                          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">₹{p.price}/{p.unit}</p>
                       </div>
                       <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
                          <Plus className="w-4 h-4" />
                       </div>
                    </button>
                  ))}
               </div>
            </div>

            {/* Main: Order Details Form */}
            <div className="flex-1 flex flex-col">
               <div className="px-10 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                  <div>
                    <h3 className="text-2xl font-black text-white italic">Create Manual Order</h3>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mt-1">Point of Sale (In-Person)</p>
                  </div>
                  <button onClick={() => setIsCreateOpen(false)} className="p-3 hover:bg-white/10 rounded-2xl text-zinc-500 transition-all"><X className="w-6 h-6" /></button>
               </div>

               <form onSubmit={orderFormik.handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                  {/* Customer Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Customer</label>
                      <select 
                        name="customer_id"
                        {...orderFormik.getFieldProps('customer_id')}
                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-purple-500 transition-all cursor-pointer"
                      >
                        <option value="" className="text-zinc-500">Select customer...</option>
                        {customers.map(c => <option key={c.id} value={c.id} className="bg-zinc-900">{c.name}</option>)}
                      </select>
                      {orderFormik.touched.customer_id && orderFormik.errors.customer_id && <p className="text-[10px] text-red-500 font-bold ml-1">{orderFormik.errors.customer_id}</p>}
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Order Source</label>
                       <div className="flex bg-white/5 rounded-2xl p-1.5 border border-white/10">
                          {['storefront', 'whatsapp', 'voice'].map(s => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => orderFormik.setFieldValue('source', s)}
                              className={cn(
                                "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                                orderFormik.values.source === s ? "bg-purple-500 text-white shadow-lg" : "text-zinc-500 hover:text-white"
                              )}
                            >
                              {s}
                            </button>
                          ))}
                       </div>
                    </div>
                  </div>

                  {/* Cart Items Table */}
                  <div className="space-y-4">
                     <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4" />
                        Current Basket
                     </h4>
                     <div className="glass rounded-3xl border border-white/5 overflow-hidden">
                        <table className="w-full text-left">
                           <thead>
                              <tr className="border-b border-white/5 bg-white/[0.02] text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                 <th className="px-6 py-4">Item Name</th>
                                 <th className="px-6 py-4 text-center">Qty</th>
                                 <th className="px-6 py-4 text-right">Line Total</th>
                                 <th className="px-6 py-4 text-right">Action</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-white/5">
                              {orderFormik.values.items.length === 0 ? (
                                <tr>
                                   <td colSpan="4" className="px-6 py-10 text-center text-zinc-500 italic text-sm">Basket is empty... Start adding items from the left.</td>
                                </tr>
                              ) : (
                                orderFormik.values.items.map(item => (
                                  <tr key={item.product_id} className="group hover:bg-white/[0.02]">
                                     <td className="px-6 py-4">
                                        <p className="font-bold text-white text-sm uppercase">{item.product_name}</p>
                                        <p className="text-[10px] text-zinc-500 tabular-nums font-bold">₹{item.price}/{item.unit}</p>
                                     </td>
                                     <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-3">
                                           <button type="button" onClick={() => updateItemQuantity(item.product_id, -1)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-all"><Minus className="w-3 h-3" /></button>
                                           <span className="font-bold text-white tabular-nums w-8 text-center">{item.quantity}</span>
                                           <button type="button" onClick={() => updateItemQuantity(item.product_id, 1)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-all"><Plus className="w-3 h-3" /></button>
                                        </div>
                                     </td>
                                     <td className="px-6 py-4 text-right">
                                        <p className="font-black text-white tabular-nums">₹{item.total.toLocaleString()}</p>
                                     </td>
                                     <td className="px-6 py-4 text-right">
                                        <button type="button" onClick={() => removeItemFromOrder(item.product_id)} className="p-2 text-zinc-600 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                     </td>
                                  </tr>
                                ))
                              )}
                           </tbody>
                        </table>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Dispatch Address</label>
                     <textarea 
                       name="delivery_address"
                       {...orderFormik.getFieldProps('delivery_address')}
                       rows="2"
                       placeholder="Enter customer shipping address..."
                       className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-emerald-500 transition-all resize-none"
                     />
                  </div>

                  <div className="p-8 bg-purple-500/5 rounded-3xl border border-purple-500/20 flex flex-col md:flex-row justify-between items-center gap-6">
                     <div>
                        <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] mb-1">Final Payable Total (Inclusive of GST)</p>
                        <p className="text-4xl font-black text-white tabular-nums tracking-tighter italic">₹{calculateGrandTotal().toLocaleString()}</p>
                     </div>
                     <button 
                       type="submit"
                       disabled={loading || orderFormik.values.items.length === 0}
                       className="w-full md:w-auto px-10 py-5 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-purple-500/20 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                     >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                        Submit Order
                     </button>
                  </div>
               </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
