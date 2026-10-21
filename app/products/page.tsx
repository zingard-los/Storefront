'use client'

import { useEffect, useState, useMemo } from 'react'
import { useAdminGuard } from '@/lib/use-admin'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiArrowLeft, 
  FiSearch, 
  FiPackage, 
  FiRefreshCw, 
  FiAlertCircle,
  FiDollarSign,
  FiAlertTriangle,
  FiGrid,
  FiList,
  FiLayers,
  FiX
} from 'react-icons/fi'
import AddProductModal from '@/app/components/AddProductModal'
import EditProductModal from '@/app/components/EditProductModal'

// Theme Configuration
const theme = {
  Orange: "#F2842F",
  White: "#FFF9F2",
  Darkblue: "#091540",
} as const;

export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  image_url: string
  created_at: string
}

export default function ProductsPage() {
  const { loading: authLoading, isAdmin } = useAdminGuard()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setProducts(data || [])
    } catch (err: any) {
      console.error('Error fetching products:', err)
      setError('Failed to load products. Please refresh or check database connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = async (newProduct: Omit<Product, 'id' | 'created_at'>) => {
    try {
      const { error: insertError } = await supabase.from('products').insert([
        {
          ...newProduct,
          price: Number(newProduct.price) || 0,
          stock: Number(newProduct.stock) || 0,
        }
      ])

      if (insertError) throw insertError
      setShowAddModal(false)
      fetchProducts()
    } catch (err: any) {
      console.error('Error adding product:', err)
      alert(`Failed to add product: ${err.message || 'Unknown error'}`)
    }
  }

  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
      const { id, created_at, ...updatePayload } = updatedProduct

      const { error: updateError } = await supabase
        .from('products')
        .update({
          ...updatePayload,
          price: Number(updatePayload.price) || 0,
          stock: Number(updatePayload.stock) || 0,
        })
        .eq('id', id)

      if (updateError) throw updateError

      setEditingProduct(null)
      fetchProducts()
    } catch (err: any) {
      console.error('Error updating product:', err)
      alert(`Failed to update product: ${err.message || 'Unknown error'}`)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return

    try {
      setActionLoading(id)
      const { error: deleteError } = await supabase.from('products').delete().eq('id', id)

      if (deleteError) throw deleteError

      setProducts(prev => prev.filter(p => p.id !== id))
    } catch (err: any) {
      console.error('Error deleting product:', err)
      alert(`Failed to delete product: ${err.message || 'Unknown error'}`)
    } finally {
      setActionLoading(null)
    }
  }

  // Analytics Metrics
  const metrics = useMemo(() => {
    const totalItems = products.length
    const totalValue = products.reduce((acc, p) => acc + (Number(p.price) || 0) * (Number(p.stock) || 0), 0)
    const lowStockCount = products.filter(p => Number(p.stock) > 0 && Number(p.stock) <= 5).length
    const outOfStockCount = products.filter(p => Number(p.stock) === 0).length

    return { totalItems, totalValue, lowStockCount, outOfStockCount }
  }, [products])

  // Extract unique categories for filtering with counts
  const categoriesWithCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    products.forEach(p => {
      const cat = p.category || 'Uncategorized'
      counts[cat] = (counts[cat] || 0) + 1
    })
    return counts
  }, [products])

  const categories = useMemo(() => {
    return ['all', ...Object.keys(categoriesWithCounts)]
  }, [categoriesWithCounts])

  // Filtered product list
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const productCat = product.category || 'Uncategorized'
      const matchesCategory = selectedCategory === 'all' || productCat === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [products, searchQuery, selectedCategory])

  if (authLoading || !isAdmin) {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      Checking access...
    </div>
  )
}

  return (
    <div className="min-h-screen bg-[#091540] text-[#FFF9F2] font-sans selection:bg-[#F2842F] selection:text-[#FFF9F2]">
      
      {/* Dynamic Background Glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-[#F2842F]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-[#1e3073]/30 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <header className="bg-[#0f1d4f]/90 backdrop-blur-md border-b border-[#1e3073] sticky top-0 z-20 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            <Link 
              href="/dashboard" 
              className="p-2.5 text-[#FFF9F2]/70 hover:text-[#FFF9F2] bg-[#0d1a45] hover:bg-[#15255e] border border-[#1e3073] rounded-xl transition-all shadow-sm"
              title="Back to Dashboard"
            >
              <FiArrowLeft size={20} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-[#FFF9F2]">
                  Products Catalog
                </h1>
                <span className="hidden sm:inline-block px-2.5 py-0.5 bg-[#F2842F]/10 text-[#F2842F] border border-[#F2842F]/30 rounded-full text-xs font-semibold">
                  {filteredProducts.length} Items
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#FFF9F2]/60 hidden sm:block mt-0.5">
                Manage inventory stock levels, categories, and pricing details
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={fetchProducts}
              className="p-2.5 bg-[#0d1a45] hover:bg-[#15255e] text-[#FFF9F2]/80 hover:text-[#FFF9F2] border border-[#1e3073] rounded-xl transition"
              title="Refresh Catalog"
            >
              <FiRefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-[#F2842F] hover:bg-[#e06d19] text-[#FFF9F2] font-semibold rounded-xl shadow-lg shadow-[#F2842F]/20 active:scale-95 transition-all duration-200 text-sm"
            >
              <FiPlus size={18} />
              <span>Add New Product</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">
        
        {/* Error Alert Banner */}
        {error && (
          <div className="p-4 bg-rose-950/70 border border-rose-500/50 rounded-2xl text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-start gap-3">
              <FiAlertCircle size={22} className="text-rose-400 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <p className="font-semibold text-rose-200 text-sm">Database Sync Issue</p>
                <p className="text-xs text-rose-300/80 mt-0.5">{error}</p>
              </div>
            </div>
            <button 
              onClick={fetchProducts}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-800/60 hover:bg-rose-800 text-[#FFF9F2] text-xs font-semibold rounded-xl transition border border-rose-500/30 shrink-0"
            >
              <FiRefreshCw size={14} /> Retry Connection
            </button>
          </div>
        )}

        {/* Catalog Metrics Summary Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#0d1a45]/80 backdrop-blur-sm border border-[#1e3073] p-4 rounded-2xl flex items-center gap-3.5 shadow-md">
            <div className="p-3 bg-[#15255e] text-[#F2842F] rounded-xl shrink-0">
              <FiLayers size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#FFF9F2]/60 uppercase tracking-wider truncate">Total Catalog</p>
              <p className="text-lg sm:text-2xl font-bold text-[#FFF9F2] mt-0.5">{metrics.totalItems}</p>
            </div>
          </div>

          <div className="bg-[#0d1a45]/80 backdrop-blur-sm border border-[#1e3073] p-4 rounded-2xl flex items-center gap-3.5 shadow-md">
            <div className="p-3 bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 rounded-xl shrink-0">
              <FiDollarSign size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#FFF9F2]/60 uppercase tracking-wider truncate">Total Value</p>
              <p className="text-lg sm:text-2xl font-bold text-[#FFF9F2] mt-0.5">
                ${metrics.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="bg-[#0d1a45]/80 backdrop-blur-sm border border-[#1e3073] p-4 rounded-2xl flex items-center gap-3.5 shadow-md">
            <div className="p-3 bg-amber-950/60 text-amber-400 border border-amber-500/30 rounded-xl shrink-0">
              <FiAlertTriangle size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#FFF9F2]/60 uppercase tracking-wider truncate">Low Stock (&le;5)</p>
              <p className="text-lg sm:text-2xl font-bold text-[#FFF9F2] mt-0.5">{metrics.lowStockCount}</p>
            </div>
          </div>

          <div className="bg-[#0d1a45]/80 backdrop-blur-sm border border-[#1e3073] p-4 rounded-2xl flex items-center gap-3.5 shadow-md">
            <div className="p-3 bg-rose-950/60 text-rose-400 border border-rose-500/30 rounded-xl shrink-0">
              <FiPackage size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#FFF9F2]/60 uppercase tracking-wider truncate">Out of Stock</p>
              <p className="text-lg sm:text-2xl font-bold text-[#FFF9F2] mt-0.5">{metrics.outOfStockCount}</p>
            </div>
          </div>
        </div>

        {/* Filter & View Mode Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-[#0d1a45]/60 p-3.5 rounded-2xl border border-[#1e3073]">
          
          {/* Search Bar */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FFF9F2]/40" size={18} />
            <input
              type="text"
              placeholder="Search by product name, description, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-[#091540] border border-[#1e3073] rounded-xl text-[#FFF9F2] placeholder-[#FFF9F2]/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#F2842F]/40 focus:border-[#F2842F] transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#FFF9F2]/40 hover:text-[#FFF9F2] p-1"
              >
                <FiX size={16} />
              </button>
            )}
          </div>

          {/* Controls Right Group */}
          <div className="flex items-center gap-3 justify-between md:justify-end overflow-x-auto">
            {/* View Toggle Buttons */}
            <div className="flex items-center p-1 bg-[#091540] border border-[#1e3073] rounded-xl shrink-0">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                  viewMode === 'table' 
                    ? 'bg-[#F2842F] text-[#FFF9F2] shadow-sm' 
                    : 'text-[#FFF9F2]/60 hover:text-[#FFF9F2]'
                }`}
                title="Table View"
              >
                <FiList size={16} />
                <span className="hidden lg:inline">Table</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                  viewMode === 'grid' 
                    ? 'bg-[#F2842F] text-[#FFF9F2] shadow-sm' 
                    : 'text-[#FFF9F2]/60 hover:text-[#FFF9F2]'
                }`}
                title="Grid View"
              >
                <FiGrid size={16} />
                <span className="hidden lg:inline">Grid</span>
              </button>
            </div>
          </div>
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat
            const count = cat === 'all' ? products.length : (categoriesWithCounts[cat] || 0)
            
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap border transition-all duration-200 ${
                  isSelected
                    ? 'bg-[#F2842F] text-[#FFF9F2] border-[#F2842F] shadow-md shadow-[#F2842F]/15'
                    : 'bg-[#0d1a45] text-[#FFF9F2]/70 border-[#1e3073] hover:border-[#F2842F]/50 hover:text-[#FFF9F2]'
                }`}
              >
                <span>{cat}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isSelected ? 'bg-[#091540]/30 text-[#FFF9F2]' : 'bg-[#15255e] text-[#FFF9F2]/60'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Product Catalog Display Area */}
        {loading ? (
          /* Skeleton Loader */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-[#0d1a45] border border-[#1e3073] p-5 rounded-2xl animate-pulse space-y-4">
                <div className="flex gap-4 items-center">
                  <div className="w-14 h-14 bg-[#15255e] rounded-xl shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-[#15255e] rounded w-3/4" />
                    <div className="h-3 bg-[#15255e] rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-[#15255e] rounded w-full" />
                <div className="flex justify-between items-center pt-2">
                  <div className="h-5 bg-[#15255e] rounded w-16" />
                  <div className="h-7 bg-[#15255e] rounded-lg w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 px-6 bg-[#0d1a45]/80 rounded-3xl border border-[#1e3073] max-w-lg mx-auto my-8 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-[#15255e] text-[#F2842F] flex items-center justify-center mx-auto mb-4 border border-[#1e3073]">
              <FiPackage size={32} />
            </div>
            <h3 className="text-xl font-bold text-[#FFF9F2] mb-1.5">
              {products.length === 0 ? 'No products in inventory' : 'No matching items found'}
            </h3>
            <p className="text-sm text-[#FFF9F2]/60 mb-6 max-w-xs mx-auto">
              {products.length === 0 
                ? 'Your store catalog is empty. Start adding your first item to manage stock.' 
                : 'No items match your active search terms or category selection.'}
            </p>
            {products.length === 0 ? (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-5 py-2.5 bg-[#F2842F] hover:bg-[#e06d19] text-[#FFF9F2] font-semibold rounded-xl text-sm transition shadow-lg shadow-[#F2842F]/20"
              >
                Create First Product
              </button>
            ) : (
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="px-5 py-2.5 bg-[#15255e] hover:bg-[#1e3073] text-[#FFF9F2] font-medium rounded-xl text-sm border border-[#1e3073] transition"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View Mode */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onEdit={setEditingProduct}
                onDelete={handleDeleteProduct}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        ) : (
          /* Table View Mode (Desktop + Mobile Card Fallback) */
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-[#0d1a45] rounded-2xl border border-[#1e3073] overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0f1d4f] border-b border-[#1e3073] text-[#FFF9F2]/60 text-xs font-bold uppercase tracking-wider">
                      <th className="py-4 px-6">Product</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Unit Price</th>
                      <th className="py-4 px-6">Stock Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e3073]/60 text-sm">
                    {filteredProducts.map((product) => {
                      const price = Number(product.price) || 0
                      const stock = Number(product.stock) || 0

                      return (
                        <tr key={product.id} className="hover:bg-[#13235b]/60 transition-colors group">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3.5">
                              {/* Product Thumbnail */}
                              <div className="w-12 h-12 rounded-xl bg-[#0f1d4f] border border-[#1e3073] overflow-hidden shrink-0 flex items-center justify-center text-[#FFF9F2]/30 group-hover:border-[#F2842F]/40 transition-colors">
                                {product.image_url ? (
                                  <img 
                                    src={product.image_url} 
                                    alt={product.name} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                                  />
                                ) : (
                                  <FiPackage size={20} />
                                )}
                              </div>
                              <div className="min-w-0 max-w-xs">
                                <p className="font-semibold text-[#FFF9F2] truncate">{product.name}</p>
                                <p className="text-xs text-[#FFF9F2]/60 truncate mt-0.5">
                                  {product.description || 'No description provided'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            <span className="px-3 py-1 bg-[#15255e] text-[#FFF9F2]/80 border border-[#1e3073] rounded-lg text-xs font-medium capitalize">
                              {product.category || 'Uncategorized'}
                            </span>
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap font-bold text-[#FFF9F2]">
                            ${price.toFixed(2)}
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStockBadgeClass(stock)}`}>
                              {stock === 0 ? 'Out of Stock' : `${stock} available`}
                            </span>
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setEditingProduct(product)}
                                className="p-2 bg-[#F2842F]/10 hover:bg-[#F2842F]/20 text-[#F2842F] border border-[#F2842F]/30 rounded-lg transition"
                                title="Edit product"
                              >
                                <FiEdit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                disabled={actionLoading === product.id}
                                className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg transition disabled:opacity-50"
                                title="Delete product"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card List View (Visible when table mode is active on phone screens) */}
            <div className="block md:hidden space-y-3">
              {filteredProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onEdit={setEditingProduct}
                  onDelete={handleDeleteProduct}
                  actionLoading={actionLoading}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Product Modals */}
      {showAddModal && (
        <AddProductModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddProduct}
        />
      )}

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onUpdate={handleUpdateProduct}
        />
      )}
    </div>
  )
}

// Subcomponent: Product Card for Mobile & Grid Layouts
function ProductCard({ 
  product, 
  onEdit, 
  onDelete, 
  actionLoading 
}: { 
  product: Product
  onEdit: (p: Product) => void
  onDelete: (id: string) => void
  actionLoading: string | null
}) {
  const price = Number(product.price) || 0
  const stock = Number(product.stock) || 0

  return (
    <div className="bg-[#0d1a45] border border-[#1e3073] rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-[#F2842F]/40 transition-all duration-200 shadow-md">
      <div>
        <div className="flex items-start gap-3.5 mb-3">
          {/* Image Thumbnail */}
          <div className="w-14 h-14 rounded-xl bg-[#0f1d4f] border border-[#1e3073] overflow-hidden shrink-0 flex items-center justify-center text-[#FFF9F2]/30">
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.name} 
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
            ) : (
              <FiPackage size={22} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="px-2.5 py-0.5 bg-[#15255e] text-[#FFF9F2]/70 border border-[#1e3073] rounded-md text-[11px] font-medium capitalize truncate max-w-[120px]">
                {product.category || 'Uncategorized'}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStockBadgeClass(stock)}`}>
                {stock === 0 ? 'Out of stock' : `${stock} left`}
              </span>
            </div>
            <h3 className="font-bold text-[#FFF9F2] text-base leading-snug line-clamp-1">{product.name}</h3>
          </div>
        </div>

        <p className="text-xs text-[#FFF9F2]/60 line-clamp-2 mb-4 leading-relaxed">
          {product.description || 'No description provided for this product.'}
        </p>
      </div>

      <div className="pt-3 border-t border-[#1e3073]/60 flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#FFF9F2]/40 block tracking-wider">Unit Price</span>
          <span className="text-lg font-extrabold text-[#FFF9F2]">${price.toFixed(2)}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(product)}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#F2842F]/10 hover:bg-[#F2842F]/20 text-[#F2842F] border border-[#F2842F]/30 rounded-xl text-xs font-semibold transition"
          >
            <FiEdit2 size={14} />
            <span>Edit</span>
          </button>
          <button
            onClick={() => onDelete(product.id)}
            disabled={actionLoading === product.id}
            className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-semibold transition disabled:opacity-50"
            title="Delete"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

// Utility Function: Dynamic Stock Badge Styling
function getStockBadgeClass(stock: number) {
  if (stock === 0) {
    return 'bg-rose-500/15 text-rose-300 border-rose-500/30'
  }
  if (stock <= 5) {
    return 'bg-amber-500/15 text-amber-300 border-amber-500/30'
  }
  return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
}