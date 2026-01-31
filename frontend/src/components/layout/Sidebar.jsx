import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Truck, 
  FileText,
  Store,
  Settings,
  HelpCircle,
  LogOut,
  Zap
} from 'lucide-react'
import { cn } from '../../lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Delivery', href: '/delivery', icon: Truck },
  { name: 'GST & Compliance', href: '/gst', icon: FileText },
]

const secondaryNav = [
  { name: 'Storefront', href: '/storefront/demo', icon: Store },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help', href: '/help', icon: HelpCircle },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[280px] flex flex-col glass">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/5">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 shadow-lg shadow-purple-500/25">
          <Zap className="w-5 h-5 text-white" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">StoreStorm</h1>
          <p className="text-xs text-zinc-500">Shop Management</p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <p className="px-3 mb-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
          Main Menu
        </p>
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-purple-500/20 to-purple-500/5 text-white border border-purple-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              )}
            >
              <item.icon 
                className={cn(
                  'w-5 h-5',
                  isActive ? 'text-purple-400' : 'text-zinc-500'
                )} 
                aria-hidden="true" 
              />
              {item.name}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400" />
              )}
            </Link>
          )
        })}

        <div className="pt-6">
          <p className="px-3 mb-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
            Other
          </p>
          {secondaryNav.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-purple-500/20 to-purple-500/5 text-white border border-purple-500/20'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                )}
              >
                <item.icon 
                  className={cn(
                    'w-5 h-5',
                    isActive ? 'text-purple-400' : 'text-zinc-500'
                  )} 
                  aria-hidden="true" 
                />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
            S
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Shop Owner</p>
            <p className="text-xs text-zinc-500 truncate">demo@storestorm.io</p>
          </div>
          <button 
            className="p-2 text-zinc-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  )
}
