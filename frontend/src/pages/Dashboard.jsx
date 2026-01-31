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
  ArrowRight
} from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import Card, { StatCard } from '../components/ui/Card'
import { Badge } from '../components/ui'
import { LoadingSpinner } from '../components/ui'
import { EmptyState } from '../components/ui'
import Button from '../components/ui/Button'
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
        const fetchedOrders = await orderService.list({ shop_id: shop.id, limit: 10 })
        setOrders(fetchedOrders)

        const lowStockProducts = await productService.list({ shop_id: shop.id, low_stock: true })

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
          revenue,
          gst
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
      icon: ShoppingCart,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/10',
      value: statsData.todayOrders,
      label: "Today's Orders",
      trend: '+0%',
      trendUp: true
    },
    {
      icon: Clock,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10',
      value: statsData.pendingOrders,
      label: 'Pending Orders'
    },
    {
      icon: AlertTriangle,
      iconColor: 'text-red-400',
      iconBg: 'bg-red-500/10',
      value: statsData.lowStock,
      label: 'Low Stock Alerts'
    },
    {
      icon: Truck,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/10',
      value: statsData.activeDeliveries,
      label: 'Active Deliveries'
    }
  ]

  const aiInsights = [
    { type: 'inventory', message: 'Rice stock running low – reorder 50kg today', severity: 'high' },
    { type: 'demand', message: 'Expected 40% order surge this weekend', severity: 'medium' },
    { type: 'delivery', message: 'Optimal delivery batch at 4 PM for MG Road area', severity: 'low' }
  ]

  const statusVariants = {
    pending: 'warning',
    confirmed: 'success',
    preparing: 'info',
    out_for_delivery: 'purple',
    delivered: 'emerald',
    cancelled: 'danger'
  }

  const severityColors = {
    high: 'bg-red-500/10 border-red-500/20',
    medium: 'bg-amber-500/10 border-amber-500/20',
    low: 'bg-green-500/10 border-green-500/20'
  }

  if (loading && !shop) {
    return (
      <DashboardLayout>
        <LoadingSpinner />
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
            key={stat.label}
            className={cn('animate-fade-in', `delay-${index + 1}`)}
            style={{ opacity: 0 }}
          >
            <StatCard {...stat} />
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card variant="glass" className="lg:col-span-2 animate-fade-in delay-3" style={{ opacity: 1 }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
            <a
              href="/orders"
              className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors focus-visible:ring-2 focus-visible:ring-purple-500 rounded outline-none"
            >
              View all
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>

          <div className="space-y-3">
            {orders.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No recent orders"
                description="Orders will appear here once customers start placing them"
              />
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/10">
                    <Package className="w-5 h-5 text-purple-400" aria-hidden="true" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white">{order.order_number}</p>
                      <Badge variant={statusVariants[order.status] || 'default'}>
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-zinc-400 truncate">
                      {order.customer_id} • {order.items?.length || 0} items
                    </p>
                  </div>

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
        </Card>

        {/* AI Insights */}
        <Card variant="glass" className="animate-fade-in delay-4" style={{ opacity: 1 }}>
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

          <Button
            variant="ghost"
            className="w-full mt-4 border border-purple-500/20 hover:border-purple-500/40"
          >
            View All Insights
          </Button>
        </Card>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card variant="glass">
          <p className="text-sm text-zinc-400">Today's Revenue</p>
          <p className="text-2xl font-bold text-white mt-1 flex items-center gap-1">
            <IndianRupee className="w-5 h-5" aria-hidden="true" />
            <span className="tabular-nums">{statsData.revenue.toLocaleString()}</span>
          </p>
          <p className="text-xs text-green-400 mt-1">Real-time data</p>
        </Card>

        <Card variant="glass">
          <p className="text-sm text-zinc-400">GST Collected (MTD)</p>
          <p className="text-2xl font-bold text-white mt-1 flex items-center gap-1">
            <IndianRupee className="w-5 h-5" aria-hidden="true" />
            <span className="tabular-nums">{statsData.gst.toLocaleString()}</span>
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            {new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}
          </p>
        </Card>

        <Card variant="glass">
          <p className="text-sm text-zinc-400">Avg. Delivery Time</p>
          <p className="text-2xl font-bold text-white mt-1 tabular-nums">
            28 min
          </p>
          <p className="text-xs text-green-400 mt-1">Optimization active</p>
        </Card>
      </div>
    </DashboardLayout>
  )
}
