import { useState, useEffect } from 'react'
import { 
  Search, 
  Plus,
  Package,
  AlertTriangle,
  TrendingUp,
  IndianRupee,
  MoreVertical,
  Filter,
  Loader2,
  Trash2,
  Edit2,
  AlertCircle,
  X,
  ChevronRight,
  Archive,
  ArrowUpDown
} from 'lucide-react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import DashboardLayout from '../components/layout/DashboardLayout'
import { cn } from '../lib/utils'
import { productService } from '../services/productService'
import { inventoryService } from '../services/inventoryService'
import { useShop } from '../context/ShopContext'

const statusConfig = {
  in_stock: { label: 'In Stock', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  low_stock: { label: 'Low Stock', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  out_of_stock: { label: 'Out of Stock', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
}

export default function Inventory() {
  const { shop } = useShop()
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  const fetchData = async () => {
    if (!shop?.id) return
    try {
      setLoading(true)
      const [fetchedProducts, fetchedInventory] = await Promise.all([
        productService.list({ shop_id: shop.id }),
        inventoryService.list({ shop_id: shop.id })
      ])
      
      const enrichedProducts = fetchedProducts.map(p => {
        const inv = fetchedInventory.find(i => i.product_id === p.id) || {
          stock_quantity: 0,
          min_stock_level: 10,
          id: null
        }
        
        let status = 'in_stock'
        if (inv.stock_quantity === 0) status = 'out_of_stock'
        else if (inv.stock_quantity <= inv.min_stock_level) status = 'low_stock'
        
        return {
          ...p,
          stock: inv.stock_quantity,
          minStock: inv.min_stock_level,
          inventory_id: inv.id,
          status
        }
      })

      setProducts(enrichedProducts)
    } catch (err) {
      console.error('Inventory fetch error:', err)
      setError('Failed to load inventory data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [shop?.id])

  const formik = useFormik({
    initialValues: {
      name: '',
      category: '',
      price: '',
      unit: 'kg',
      gst_rate: 5,
      stock_quantity: 0,
      min_stock_level: 10
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Product name is required'),
      category: Yup.string().required('Category is required'),
      price: Yup.number().positive('Price must be positive').required('Required'),
      unit: Yup.string().required('Unit is required'),
      gst_rate: Yup.number().min(0, 'Min 0').max(100, 'Max 100').required('Required'),
      stock_quantity: Yup.number().min(0, 'Stock cannot be negative').required('Required'),
      min_stock_level: Yup.number().min(0, 'Min level cannot be negative').required('Required'),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true)
        const productData = {
          name: values.name,
          category: values.category,
          shop_id: shop.id,
          price: parseFloat(values.price),
          unit: values.unit,
          gst_rate: parseFloat(values.gst_rate)
        }

        let savedProduct
        if (editingProduct) {
          savedProduct = await productService.update(editingProduct.id, productData)
        } else {
          savedProduct = await productService.create(productData)
        }

        const inventoryData = {
          shop_id: shop.id,
          product_id: savedProduct.id,
          stock_quantity: parseFloat(values.stock_quantity),
          min_stock_level: parseFloat(values.min_stock_level)
        }

        if (editingProduct?.inventory_id) {
          await inventoryService.update(editingProduct.inventory_id, inventoryData)
        } else {
          const existing = await inventoryService.list({ product_id: savedProduct.id })
          if (existing.length > 0) {
            await inventoryService.update(existing[0].id, inventoryData)
          } else {
            await inventoryService.create(inventoryData)
          }
        }
        
        setIsModalOpen(false)
        fetchData()
      } catch (err) {
        console.error('Save error:', err)
        setError('Failed to save changes')
      } finally {
        setLoading(false)
      }
    }
  })

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product)
      formik.setValues({
        name: product.name,
        category: product.category,
        price: product.price,
        unit: product.unit,
        gst_rate: product.gst_rate,
        stock_quantity: product.stock,
        min_stock_level: product.minStock
      })
    } else {
      setEditingProduct(null)
      formik.resetForm()
    }
    setError(null)
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product? This will also remove associated inventory records.')) return
    try {
      setLoading(true)
      await productService.delete(id)
      setProducts(products.filter(p => p.id !== id))
    } catch (err) {
      setError('Failed to delete product')
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = [
    { label: 'Total Products', value: products.length, icon: Package, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Low Stock', value: products.filter(p => p.status === 'low_stock').length, icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Out of Stock', value: products.filter(p => p.status === 'out_of_stock').length, icon: Archive, color: 'text-red-400', bg: 'bg-red-500/10' },
  ]

  return (
    <DashboardLayout>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Inventory</h1>
          <p className="mt-1 text-zinc-400">Manage your product catalog and real-time stock levels</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 rounded-2xl shadow-lg shadow-purple-500/25 transition-all active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          Add New Product
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="glass rounded-3xl p-6 border border-white/5 bg-white/[0.02] flex items-center gap-4">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border", stat.bg, stat.color.replace('text', 'border'))}>
              <stat.icon className={cn("w-7 h-7", stat.color)} />
            </div>
            <div>
              <p className="text-3xl font-black text-white tabular-nums">{stat.value}</p>
              <p className="text-sm font-semibold text-zinc-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="w-full md:flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="search"
              placeholder="Search by product name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 hover:border-white/20 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 rounded-2xl text-white transition-all outline-none"
            />
          </div>
        </div>
        <button className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-zinc-400 hover:text-white bg-white/5 border border-white/10 rounded-2xl transition-all">
          <Filter className="w-4 h-4" />
          Filter Options
        </button>
      </div>

      {/* Products Table */}
      <div className="glass rounded-3xl border border-white/5 overflow-hidden min-h-[400px]">
        {loading && products.length === 0 ? (
          <div className="flex items-center justify-center h-[400px]">
             <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-5 text-xs font-bold text-zinc-500 uppercase tracking-widest">Product Info</th>
                  <th className="px-6 py-5 text-xs font-bold text-zinc-500 uppercase tracking-widest">Category</th>
                  <th className="px-6 py-5 text-xs font-bold text-zinc-500 uppercase tracking-widest text-right">Unit Price</th>
                  <th className="px-6 py-5 text-xs font-bold text-zinc-500 uppercase tracking-widest text-center">Available Stock</th>
                  <th className="px-6 py-5 text-xs font-bold text-zinc-500 uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-5 text-xs font-bold text-zinc-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3 text-zinc-500">
                         <Archive className="w-12 h-12 opacity-20" />
                         <p className="text-lg font-medium">No products found</p>
                         <button onClick={() => openModal()} className="text-purple-400 font-bold hover:underline">Add your first product</button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-white/[0.03] transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                            <Package className="w-6 h-6" />
                          </div>
                          <div>
                             <p className="font-bold text-white group-hover:text-purple-400 transition-colors uppercase tracking-tight">{product.name}</p>
                             <p className="text-xs text-zinc-500 italic uppercase">GST: {product.gst_rate}%</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-zinc-400 uppercase tracking-widest">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right font-black text-white tabular-nums">
                        <div className="flex items-center justify-end gap-1">
                          <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                          {product.price}
                          <span className="text-[10px] text-zinc-500 uppercase font-bold">/{product.unit}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className={cn(
                            "text-lg font-black tabular-nums transition-colors",
                            product.status === 'out_of_stock' ? "text-red-400" : product.status === 'low_stock' ? "text-amber-400" : "text-white"
                          )}>
                            {product.stock}
                          </span>
                          <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Min: {product.minStock}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={cn(
                          'px-3 py-1 text-[10px] font-black rounded-full border uppercase tracking-widest inline-block',
                          statusConfig[product.status]?.color
                        )}>
                          {statusConfig[product.status]?.label}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openModal(product)}
                            className="p-2.5 text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(product.id)}
                            className="p-2.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                  {editingProduct ? <Edit2 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                </div>
                <div>
                   <h3 className="text-xl font-black text-white">{editingProduct ? 'Update Product' : 'Add New Product'}</h3>
                   <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Comprehensive inventory tracking</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-3 hover:bg-white/10 rounded-2xl text-zinc-400 hover:text-white transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={formik.handleSubmit} className="p-8 space-y-8">
              {/* Product Info Section */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Product Name</label>
                    <input 
                      name="name"
                      {...formik.getFieldProps('name')}
                      placeholder="e.g. Alphonso Mangoes"
                      className={cn(
                        "w-full px-5 py-4 bg-white/5 border rounded-2xl text-white outline-none focus:ring-2 transition-all",
                        formik.touched.name && formik.errors.name ? "border-red-400/50 focus:ring-red-400/10" : "border-white/10 focus:border-purple-500 focus:ring-purple-500/10"
                      )}
                    />
                    {formik.touched.name && formik.errors.name && <p className="text-[10px] text-red-400 font-bold ml-1">{formik.errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Category</label>
                    <input 
                      name="category"
                      {...formik.getFieldProps('category')}
                      placeholder="e.g. Fruits & Veg"
                      className={cn(
                        "w-full px-5 py-4 bg-white/5 border rounded-2xl text-white outline-none focus:ring-2 transition-all",
                        formik.touched.category && formik.errors.category ? "border-red-400/50 focus:ring-red-400/10" : "border-white/10 focus:border-purple-500 focus:ring-purple-500/10"
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                   <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Unit</label>
                    <select 
                      name="unit"
                      {...formik.getFieldProps('unit')}
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-purple-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value="kg" className="bg-[#1a1a1f]">kg</option>
                      <option value="L" className="bg-[#1a1a1f]">L</option>
                      <option value="pkt" className="bg-[#1a1a1f]">pkt</option>
                      <option value="pcs" className="bg-[#1a1a1f]">pcs</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Price (₹)</label>
                    <input 
                      type="number"
                      name="price"
                      {...formik.getFieldProps('price')}
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">GST (%)</label>
                    <input 
                      type="number"
                      name="gst_rate"
                      {...formik.getFieldProps('gst_rate')}
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-purple-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Inventory Info Section */}
              <div className="grid grid-cols-2 gap-8 pt-4 border-t border-white/5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="w-4 h-4 text-purple-400" />
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Initial Stock</label>
                  </div>
                  <input 
                    type="number"
                    name="stock_quantity"
                    {...formik.getFieldProps('stock_quantity')}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-purple-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Low Stock Alert Level</label>
                  </div>
                  <input 
                    type="number"
                    name="min_stock_level"
                    {...formik.getFieldProps('min_stock_level')}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 animate-pulse">
                   <AlertCircle className="w-5 h-5 text-red-400" />
                   <p className="text-red-400 text-sm font-bold">{error}</p>
                </div>
              )}

              <div className="flex items-center gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 text-sm font-bold text-zinc-500 hover:text-white transition-all uppercase tracking-widest"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  disabled={loading || !formik.isValid}
                  className="flex-[2] py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-2xl font-black shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 uppercase tracking-widest border border-white/10"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : editingProduct ? 'Update Product' : 'Register Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
