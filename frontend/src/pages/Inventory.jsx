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
  Trash2,
  Edit2,
  Archive,
  ArrowUpDown,
  Sparkles,
  Wand2
} from 'lucide-react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import DashboardLayout from '../components/layout/DashboardLayout'
import { cn } from '../lib/utils'
import { Badge, Button, Input, Modal, ModalFooter, LoadingSpinner, EmptyState, Card } from '../components/ui'
import { productService } from '../services/productService'
import { inventoryService } from '../services/inventoryService'
import { aiService } from '../services/aiService'
import { useShop } from '../context/ShopContext'

const statusConfig = {
  in_stock: { label: 'In Stock', color: 'success' },
  low_stock: { label: 'Low Stock', color: 'warning' },
  out_of_stock: { label: 'Out of Stock', color: 'danger' },
}

export default function Inventory() {
  const { shop } = useShop()
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [isSuggesting, setIsSuggesting] = useState(false)
  
  // Pagination State
  const [page, setPage] = useState(1)
  const [limit] = useState(20)

  const fetchData = async () => {
    if (!shop?.id) return
    try {
      setLoading(true)
      const [fetchedProducts, fetchedInventory] = await Promise.all([
        productService.list({ 
          shop_id: shop.id,
          skip: (page - 1) * limit,
          limit: limit
        }),
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
        setEditingProduct(null)
        formik.resetForm()
        fetchData()
      } catch (err) {
        console.error('Save error:', err)
        setError('Failed to save changes')
      } finally {
        setLoading(false)
      }
    }
  })

  const handleGSTSuggest = async () => {
    if (!formik.values.name) {
      alert('Please enter a product name first')
      return
    }

    try {
      setIsSuggesting(true)
      const result = await aiService.categorizeGST(formik.values.name, formik.values.category)
      
      if (result.success && result.gst_info) {
        const { gst_rate, category, explanation } = result.gst_info
        formik.setFieldValue('gst_rate', gst_rate)
        if (category && !formik.values.category) {
          formik.setFieldValue('category', category)
        }
        // Success feedback could be added here
      }
    } catch (err) {
      console.error('GST Suggest Error:', err)
    } finally {
      setIsSuggesting(false)
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    formik.setValues({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      unit: product.unit,
      gst_rate: product.gst_rate,
      stock_quantity: product.stock,
      min_stock_level: product.minStock
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      await productService.delete(productId)
      fetchData()
    } catch (err) {
      console.error('Delete error:', err)
      setError('Failed to delete product')
    }
  }

  const handleAddNew = () => {
    setEditingProduct(null)
    formik.resetForm()
    setIsModalOpen(true)
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || product.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: products.length,
    in_stock: products.filter(p => p.status === 'in_stock').length,
    low_stock: products.filter(p => p.status === 'low_stock').length,
    out_of_stock: products.filter(p => p.status === 'out_of_stock').length,
  }

  if (loading && products.length === 0) {
    return (
      <DashboardLayout>
        <LoadingSpinner />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Inventory</h1>
          <p className="mt-1 text-zinc-400">Manage your products and stock levels</p>
        </div>
        <Button variant="primary" onClick={handleAddNew}>
          <Plus className="w-4 h-4" aria-hidden="true" />
          Add Product
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Total Products</p>
              <p className="text-2xl font-bold text-white mt-1 tabular-nums">{stats.total}</p>
            </div>
            <Package className="w-8 h-8 text-purple-400" aria-hidden="true" />
          </div>
        </Card>
        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">In Stock</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1 tabular-nums">{stats.in_stock}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-emerald-400" aria-hidden="true" />
          </div>
        </Card>
        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Low Stock</p>
              <p className="text-2xl font-bold text-amber-400 mt-1 tabular-nums">{stats.low_stock}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-amber-400" aria-hidden="true" />
          </div>
        </Card>
        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Out of Stock</p>
              <p className="text-2xl font-bold text-red-400 mt-1 tabular-nums">{stats.out_of_stock}</p>
            </div>
            <Archive className="w-8 h-8 text-red-400" aria-hidden="true" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Input
          placeholder="Search products…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
          wrapperClassName="flex-1"
        />
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-500" aria-hidden="true" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 bg-black/40 border border-white/10 hover:border-white/20 rounded-xl text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
          >
            <option value="all">All Stock</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products found"
          description={searchTerm ? "Try a different search term" : "Add your first product to get started"}
          action={
            !searchTerm && (
              <Button onClick={handleAddNew}>
                Add Product
              </Button>
            )
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product, idx) => (
              <Card key={product.id || product.$id || `prod-${idx}`} variant="glass" className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{product.name}</h3>
                    <p className="text-sm text-zinc-400 capitalize">{product.category}</p>
                  </div>
                  <div className="relative group">
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors" aria-label="More options">
                      <MoreVertical className="w-4 h-4 text-zinc-400" aria-hidden="true" />
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-[#1a1a24] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                      <button
                        onClick={() => handleEdit(product)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" aria-hidden="true" />
                        Edit Product
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors rounded-b-xl"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                        Delete Product
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Price</span>
                    <span className="flex items-center gap-1 text-white font-bold">
                      <IndianRupee className="w-3 h-3" aria-hidden="true" />
                      <span className="tabular-nums">{product.price}</span>
                      <span className="text-xs text-zinc-500">/{product.unit}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">GST Rate</span>
                    <span className="text-white font-medium tabular-nums">{product.gst_rate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Stock</span>
                    <span className="text-white font-bold tabular-nums">{product.stock} {product.unit}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Min Level</span>
                    <span className="text-zinc-500 font-medium tabular-nums">{product.minStock} {product.unit}</span>
                  </div>
                </div>

                <Badge variant={statusConfig[product.status].color} className="w-full justify-center">
                  {statusConfig[product.status].label}
                </Badge>
              </Card>
            ))}
          </div>
          
          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-8 bg-white/5 p-4 rounded-3xl border border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Page</span>
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 font-bold text-sm">
                {page}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="border border-white/5"
                onClick={() => {
                  setPage(p => Math.max(1, p - 1))
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="neutral"
                size="sm"
                className="bg-cyan-500 text-white hover:bg-cyan-400 border-none shadow-lg shadow-cyan-500/20"
                onClick={() => {
                  setPage(p => p + 1)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                disabled={products.length < limit}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Add/Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingProduct(null)
          formik.resetForm()
        }}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        size="lg"
      >
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Product Details */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Product Name"
              name="name"
              required
              {...formik.getFieldProps('name')}
              error={formik.touched.name && formik.errors.name}
            />
            <Input
              label="Category"
              name="category"
              required
              placeholder="e.g., Grocery, Dairy"
              {...formik.getFieldProps('category')}
              error={formik.touched.category && formik.errors.category}
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Price"
              name="price"
              type="number"
              step="0.01"
              required
              leftIcon={<IndianRupee className="w-4 h-4" />}
              {...formik.getFieldProps('price')}
              error={formik.touched.price && formik.errors.price}
            />
            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-zinc-400 mb-1">
                Unit <span className="text-red-400">*</span>
              </label>
              <select
                id="unit"
                name="unit"
                {...formik.getFieldProps('unit')}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 hover:border-white/20 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl text-white transition-colors outline-none"
              >
                <option value="kg">Kilogram (kg)</option>
                <option value="g">Gram (g)</option>
                <option value="l">Liter (l)</option>
                <option value="ml">Milliliter (ml)</option>
                <option value="pcs">Pieces (pcs)</option>
                <option value="box">Box</option>
                <option value="dozen">Dozen</option>
              </select>
            </div>
            <div className="relative">
              <Input
                label="GST Rate (%)"
                name="gst_rate"
                type="number"
                step="0.01"
                required
                {...formik.getFieldProps('gst_rate')}
                error={formik.touched.gst_rate && formik.errors.gst_rate}
              />
              <button
                type="button"
                onClick={handleGSTSuggest}
                disabled={isSuggesting || !formik.values.name}
                className="absolute right-2 top-8 p-2 text-purple-400 hover:text-purple-300 disabled:text-zinc-600 disabled:cursor-not-allowed transition-colors"
                title="AI Smart Suggest"
              >
                {isSuggesting ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Stock Levels */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Current Stock"
              name="stock_quantity"
              type="number"
              step="0.01"
              required
              {...formik.getFieldProps('stock_quantity')}
              error={formik.touched.stock_quantity && formik.errors.stock_quantity}
              helperText="Current quantity in inventory"
            />
            <Input
              label="Minimum Stock Level"
              name="min_stock_level"
              type="number"
              step="0.01"
              required
              {...formik.getFieldProps('min_stock_level')}
              error={formik.touched.min_stock_level && formik.errors.min_stock_level}
              helperText="Alert when stock falls below this"
            />
          </div>

          <ModalFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsModalOpen(false)
                setEditingProduct(null)
                formik.resetForm()
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
            >
              {editingProduct ? 'Update Product' : 'Add Product'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </DashboardLayout>
  )
}
