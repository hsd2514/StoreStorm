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
  MessageSquare
} from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { cn } from '../lib/utils'

const orders = [
  { 
    id: 'ORD-001', 
    customer: 'Rahul Sharma', 
    phone: '+91 98765 43210',
    items: [
      { name: 'Basmati Rice', qty: 5, unit: 'kg' },
      { name: 'Toor Dal', qty: 2, unit: 'kg' },
      { name: 'Sunflower Oil', qty: 1, unit: 'L' },
    ],
    total: 1250, 
    status: 'pending', 
    source: 'whatsapp',
    time: '2 min ago',
    address: '12, MG Road, Bangalore'
  },
  { 
    id: 'ORD-002', 
    customer: 'Priya Patel', 
    phone: '+91 87654 32109',
    items: [
      { name: 'Milk', qty: 2, unit: 'L' },
      { name: 'Bread', qty: 1, unit: 'pcs' },
      { name: 'Eggs', qty: 12, unit: 'pcs' },
    ],
    total: 780, 
    status: 'confirmed', 
    source: 'storefront',
    time: '15 min ago',
    address: '45, Koramangala, Bangalore'
  },
  { 
    id: 'ORD-003', 
    customer: 'Amit Kumar', 
    phone: '+91 76543 21098',
    items: [
      { name: 'Atta', qty: 10, unit: 'kg' },
      { name: 'Sugar', qty: 5, unit: 'kg' },
    ],
    total: 2100, 
    status: 'preparing', 
    source: 'voice',
    time: '32 min ago',
    address: '78, Indiranagar, Bangalore'
  },
  { 
    id: 'ORD-004', 
    customer: 'Sneha Gupta', 
    phone: '+91 65432 10987',
    items: [
      { name: 'Tomatoes', qty: 2, unit: 'kg' },
      { name: 'Onions', qty: 3, unit: 'kg' },
    ],
    total: 450, 
    status: 'out_for_delivery', 
    source: 'whatsapp',
    time: '1 hr ago',
    address: '23, HSR Layout, Bangalore'
  },
]

const statusConfig = {
  pending: { 
    label: 'Pending', 
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    icon: Clock 
  },
  confirmed: { 
    label: 'Confirmed', 
    color: 'bg-green-500/10 text-green-400 border-green-500/20',
    icon: CheckCircle 
  },
  preparing: { 
    label: 'Preparing', 
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    icon: Package 
  },
  out_for_delivery: { 
    label: 'Out for Delivery', 
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    icon: Truck 
  },
}

const sourceConfig = {
  whatsapp: { label: 'WhatsApp', color: 'text-green-400' },
  storefront: { label: 'Storefront', color: 'text-blue-400' },
  voice: { label: 'Voice Call', color: 'text-amber-400' },
}

export default function Orders() {
  return (
    <DashboardLayout>
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Orders</h1>
          <p className="mt-1 text-zinc-400">
            Manage and track all incoming orders
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]">
          <Plus className="w-4 h-4" aria-hidden="true" />
          New Order
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search orders…"
              className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl text-white placeholder-zinc-500 transition-colors outline-none"
            />
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors">
          <Filter className="w-4 h-4" aria-hidden="true" />
          Filters
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'pending', 'confirmed', 'preparing', 'out_for_delivery'].map((status) => (
          <button
            key={status}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors',
              status === 'all'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            )}
          >
            {status === 'all' ? 'All Orders' : statusConfig[status]?.label || status}
          </button>
        ))}
      </div>

      {/* Orders list */}
      <div className="space-y-4">
        {orders.map((order) => {
          const StatusIcon = statusConfig[order.status]?.icon || Clock
          return (
            <div
              key={order.id}
              className="glass rounded-2xl p-6 hover:bg-white/[0.03] transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/10">
                    <Package className="w-6 h-6 text-purple-400" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">{order.id}</h3>
                      <span className={cn(
                        'px-2.5 py-1 text-xs font-medium rounded-full border',
                        statusConfig[order.status]?.color
                      )}>
                        {statusConfig[order.status]?.label}
                      </span>
                      <span className={cn('text-xs', sourceConfig[order.source]?.color)}>
                        via {sourceConfig[order.source]?.label}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400 mt-1">
                      {order.customer} • {order.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    aria-label="Message customer"
                  >
                    <MessageSquare className="w-5 h-5" aria-hidden="true" />
                  </button>
                  <button 
                    className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    aria-label="More options"
                  >
                    <MoreVertical className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Order items */}
              <div className="flex flex-wrap gap-2 mb-4">
                {order.items.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 text-sm bg-white/5 text-zinc-300 rounded-lg"
                  >
                    {item.name} × {item.qty} {item.unit}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="text-sm text-zinc-500">
                  📍 {order.address}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-zinc-500">{order.time}</span>
                  <span className="text-lg font-semibold text-white flex items-center gap-1">
                    <IndianRupee className="w-4 h-4" aria-hidden="true" />
                    <span className="tabular-nums">{order.total.toLocaleString()}</span>
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </DashboardLayout>
  )
}
