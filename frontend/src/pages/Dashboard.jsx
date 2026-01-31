import { useState, useEffect } from 'react'
import { 
  ShoppingCart, 
  Clock, 
  AlertTriangle, 
  Truck,
  TrendingUp,
  TrendingDown,
  Package,
  IndianRupee,
  Sparkles,
  ArrowRight,
  Loader2
} from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { cn } from '../lib/utils'
import { orderService } from '../services/orderService'
import { productService } from '../services/productService'
import { useShop } from '../context/ShopContext'

export default function Dashboard() {
  const { shop } = useShop()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [orders, setOrders] = useState([])
  const [statsData, setStatsData] = useState({
    todayOrders: 0,
    pendingOrders: 0,
    lowStock: 0,
    activeDeliveries: 0,
    revenue: 0,
    gst: 0
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!shop?.id) return
      
      try {
        setLoading(true)
        // Fetch real orders
        const fetchedOrders = await orderService.list({ shop_id: shop.id, limit: 10 })
        setOrders(fetchedOrders)

        // Fetch low stock count
        const lowStockProducts = await productService.list({ shop_id: shop.id, low_stock: true })
        
        // Calculate stats from orders
        const today = new Date().toISOString().split('T')[0]
        const todayOrders = fetchedOrders.filter(o => o.created_at?.startsWith(today))
        const pending = fetchedOrders.filter(o => o.status === 'pending').length
        const revenue = fetchedOrders.reduce((sum, o) => sum + o.total_amount, 0)
        const gst = fetchedOrders.reduce((sum, o) => sum + o.gst_amount, 0)

        setStatsData({
          todayOrders: todayOrders.length,
          pendingOrders: pending,
          lowStock: lowStockProducts?.length || 0,
          activeDeliveries: fetchedOrders.filter(o => o.status === 'out_for_delivery').length,
          revenue: revenue,
          gst: gst
        })
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [shop?.id])

  const stats = [
    {
      name: "Today's Orders",
      value: statsData.todayOrders,
      change: '+0%', // Mock for now or calculate from yesterday
      trend: 'up',
      icon: ShoppingCart,
      color: 'purple',
      gradient: 'from-purple-500/20 to-purple-500/5',
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-400',
      borderColor: 'border-purple-500/20',
    },
    {
      name: 'Pending Orders',
      value: statsData.pendingOrders,
      change: '0',
      trend: 'down',
      icon: Clock,
      color: 'amber',
      gradient: 'from-amber-500/20 to-amber-500/5',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-400',
      borderColor: 'border-amber-500/20',
    },
    {
      name: 'Low Stock Alerts',
      value: statsData.lowStock,
      change: '0',
      trend: 'up',
      icon: AlertTriangle,
      color: 'red',
      gradient: 'from-red-500/20 to-red-500/5',
      iconBg: 'bg-red-500/10',
      iconColor: 'text-red-400',
      borderColor: 'border-red-500/20',
    },
    {
      name: 'Active Deliveries',
      value: statsData.activeDeliveries,
      change: '0',
      trend: 'up',
      icon: Truck,
      color: 'cyan',
      gradient: 'from-cyan-500/20 to-cyan-500/5',
      iconBg: 'bg-cyan-500/10',
      iconColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/20',
    },
  ]

  // AI insights (Mock for now, will connect to AI service later)
  const aiInsights = [
    { type: 'inventory', message: 'Rice stock running low – reorder 50kg today', severity: 'high' },
    { type: 'demand', message: 'Expected 40% order surge this weekend', severity: 'medium' },
    { type: 'delivery', message: 'Optimal delivery batch at 4 PM for MG Road area', severity: 'low' },
  ]

  const statusColors = {
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    confirmed: 'bg-green-500/10 text-green-400 border-green-500/20',
    preparing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    out_for_delivery: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  }

  const severityColors = {
    high: 'bg-red-500/10 border-red-500/20',
    medium: 'bg-amber-500/10 border-amber-500/20',
    low: 'bg-green-500/10 border-green-500/20',
  }

  if (loading && !shop) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }
  return (
    <DashboardLayout>
      {/* Page header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-white">
          Good morning! ☀️
        </h1>
        <p className="mt-1 text-zinc-400">
          Here's what's happening with your store today.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div
            key={stat.name}
            className={cn(
              'relative overflow-hidden rounded-2xl p-6 border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer animate-fade-in',
              `bg-gradient-to-br ${stat.gradient}`,
              stat.borderColor,
              `delay-${index + 1}`
            )}
            style={{ opacity: 0 }}
          >
            {/* Icon */}
            <div className={cn('flex items-center justify-center w-12 h-12 rounded-xl mb-4', stat.iconBg)}>
              <stat.icon className={cn('w-6 h-6', stat.iconColor)} aria-hidden="true" />
            </div>

            {/* Value */}
            <p className="text-4xl font-bold text-white tabular-nums">
              {stat.value}
            </p>

            {/* Label and change */}
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm text-zinc-400">{stat.name}</p>
              <span className={cn(
                'flex items-center gap-1 text-xs font-medium',
                stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
              )}>
                {stat.trend === 'up' ? (
                  <TrendingUp className="w-3 h-3" aria-hidden="true" />
                ) : (
                  <TrendingDown className="w-3 h-3" aria-hidden="true" />
                )}
                {stat.change}
              </span>
            </div>

            {/* Decorative gradient */}
            <div 
              className="absolute -top-12 -right-12 w-32 h-32 opacity-20 blur-2xl"
              style={{ background: `radial-gradient(circle, var(--tw-gradient-from) 0%, transparent 70%)` }}
              aria-hidden="true"
            />
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 animate-fade-in delay-3" style={{ opacity: 1 }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
            <a 
              href="/orders" 
              className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              View all
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>

          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 italic">
                No recent orders found
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  {/* Order icon */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/10">
                    <Package className="w-5 h-5 text-purple-400" aria-hidden="true" />
                  </div>

                  {/* Order details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white">{order.order_number}</p>
                      <span className={cn(
                        'px-2 py-0.5 text-xs font-medium rounded-full border',
                        statusColors[order.status]
                      )}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400 truncate">
                      {order.customer_id} • {order.items?.length || 0} items
                    </p>
                  </div>

                  {/* Amount and time */}
                  <div className="text-right">
                    <p className="text-sm font-medium text-white flex items-center justify-end gap-1">
                      <IndianRupee className="w-3 h-3" aria-hidden="true" />
                      <span className="tabular-nums">{order.total_amount.toLocaleString()}</span>
                    </p>
                    <p className="text-xs text-zinc-500">
                      {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Insights */}
        <div className="glass rounded-2xl p-6 animate-fade-in delay-4" style={{ opacity: 1 }}>
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500">
              <Sparkles className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-semibold text-white">AI Insights</h2>
          </div>

          <div className="space-y-3">
            {aiInsights.map((insight, index) => (
              <div
                key={index}
                className={cn(
                  'p-4 rounded-xl border transition-all hover:scale-[1.01] cursor-pointer',
                  severityColors[insight.severity]
                )}
              >
                <p className="text-sm text-zinc-200">{insight.message}</p>
                <p className="mt-2 text-xs text-zinc-500 capitalize">
                  {insight.type} • {insight.severity} priority
                </p>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 px-4 py-3 text-sm font-medium text-purple-400 hover:text-white bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-xl transition-all">
            View All Insights
          </button>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="glass rounded-2xl p-6">
          <p className="text-sm text-zinc-400">Today's Revenue</p>
          <p className="text-2xl font-bold text-white mt-1 flex items-center gap-1">
            <IndianRupee className="w-5 h-5" aria-hidden="true" />
            <span className="tabular-nums">{statsData.revenue.toLocaleString()}</span>
          </p>
          <p className="text-xs text-green-400 mt-1">Real-time data</p>
        </div>

        <div className="glass rounded-2xl p-6">
          <p className="text-sm text-zinc-400">GST Collected (MTD)</p>
          <p className="text-2xl font-bold text-white mt-1 flex items-center gap-1">
            <IndianRupee className="w-5 h-5" aria-hidden="true" />
            <span className="tabular-nums">{statsData.gst.toLocaleString()}</span>
          </p>
          <p className="text-xs text-zinc-500 mt-1">{new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}</p>
        </div>

        <div className="glass rounded-2xl p-6">
          <p className="text-sm text-zinc-400">Avg. Delivery Time</p>
          <p className="text-2xl font-bold text-white mt-1 tabular-nums">
            28 min
          </p>
          <p className="text-xs text-green-400 mt-1">Optimization active</p>
        </div>
      </div>
    </DashboardLayout>
  )
}
