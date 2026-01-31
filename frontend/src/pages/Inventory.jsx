import { 
  Search, 
  Plus,
  Package,
  AlertTriangle,
  TrendingUp,
  IndianRupee,
  MoreVertical,
  Filter
} from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { cn } from '../lib/utils'

const products = [
  { 
    id: 1, 
    name: 'Basmati Rice', 
    category: 'Grains',
    price: 85,
    unit: 'kg',
    stock: 120,
    minStock: 50,
    gstRate: 5,
    status: 'in_stock'
  },
  { 
    id: 2, 
    name: 'Toor Dal', 
    category: 'Pulses',
    price: 140,
    unit: 'kg',
    stock: 45,
    minStock: 30,
    gstRate: 5,
    status: 'in_stock'
  },
  { 
    id: 3, 
    name: 'Sunflower Oil', 
    category: 'Oils',
    price: 180,
    unit: 'L',
    stock: 8,
    minStock: 20,
    gstRate: 5,
    status: 'low_stock'
  },
  { 
    id: 4, 
    name: 'Sugar', 
    category: 'Essentials',
    price: 45,
    unit: 'kg',
    stock: 200,
    minStock: 100,
    gstRate: 5,
    status: 'in_stock'
  },
  { 
    id: 5, 
    name: 'Milk', 
    category: 'Dairy',
    price: 60,
    unit: 'L',
    stock: 5,
    minStock: 15,
    gstRate: 0,
    status: 'low_stock'
  },
  { 
    id: 6, 
    name: 'Atta', 
    category: 'Grains',
    price: 38,
    unit: 'kg',
    stock: 0,
    minStock: 50,
    gstRate: 0,
    status: 'out_of_stock'
  },
]

const statusConfig = {
  in_stock: { label: 'In Stock', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  low_stock: { label: 'Low Stock', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  out_of_stock: { label: 'Out of Stock', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
}

export default function Inventory() {
  const lowStockCount = products.filter(p => p.status === 'low_stock').length
  const outOfStockCount = products.filter(p => p.status === 'out_of_stock').length

  return (
    <DashboardLayout>
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Inventory</h1>
          <p className="mt-1 text-zinc-400">
            Manage your product catalog and stock levels
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]">
          <Plus className="w-4 h-4" aria-hidden="true" />
          Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-500/10">
              <Package className="w-6 h-6 text-green-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">{products.length}</p>
              <p className="text-sm text-zinc-400">Total Products</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10">
              <AlertTriangle className="w-6 h-6 text-amber-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">{lowStockCount}</p>
              <p className="text-sm text-zinc-400">Low Stock Items</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-500/10">
              <TrendingUp className="w-6 h-6 text-red-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">{outOfStockCount}</p>
              <p className="text-sm text-zinc-400">Out of Stock</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search products…"
              className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl text-white placeholder-zinc-500 transition-colors outline-none"
            />
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors">
          <Filter className="w-4 h-4" aria-hidden="true" />
          Filters
        </button>
      </div>

      {/* Products table */}
      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">GST</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/10">
                      <Package className="w-5 h-5 text-purple-400" aria-hidden="true" />
                    </div>
                    <span className="text-sm font-medium text-white">{product.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-400">{product.category}</td>
                <td className="px-6 py-4">
                  <span className="text-sm text-white flex items-center gap-1">
                    <IndianRupee className="w-3 h-3" aria-hidden="true" />
                    <span className="tabular-nums">{product.price}</span>
                    <span className="text-zinc-500">/{product.unit}</span>
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    'text-sm tabular-nums',
                    product.stock <= product.minStock ? 'text-amber-400' : 'text-white'
                  )}>
                    {product.stock} {product.unit}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-400 tabular-nums">{product.gstRate}%</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    'px-2.5 py-1 text-xs font-medium rounded-full border',
                    statusConfig[product.status]?.color
                  )}>
                    {statusConfig[product.status]?.label}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    aria-label="More options"
                  >
                    <MoreVertical className="w-4 h-4" aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  )
}
