'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { addToCart, getCart } from '@/lib/cart'
import {
  FiShoppingCart,
  FiSearch,
  FiPackage,
  FiCheck,
  FiAlertCircle,
  FiX
} from 'react-icons/fi'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  category: string | null
  image_url: string | null
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [cartCount, setCartCount] = useState(0)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Fetch products
  useEffect(() => {
    fetchProducts()
  }, [])

  // Cart listener
  useEffect(() => {
    const updateCount = () => {
      const total = getCart().reduce((sum, item) => sum + item.qty, 0)
      setCartCount(total)
    }

    updateCount()
    window.addEventListener('cart-updated', updateCount)
    return () => window.removeEventListener('cart-updated', updateCount)
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching products:', error)
      } else {
        setProducts(
          (data || []).map((p) => ({
            ...p,
            price: Number(p.price) || 0,
            stock: Number(p.stock) || 0,
          }))
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product: Product) => {
    const added = addToCart(
      { id: product.id, name: product.name, price: product.price },
      product.stock
    )

    if (added) {
      setToast({ message: `Added ${product.name} to cart`, type: 'success' })
    } else {
      setToast({ message: `No more ${product.name} available in stock`, type: 'error' })
    }

    setTimeout(() => setToast(null), 3000)
  }

  // Categories with counts
  const categoriesWithCounts = useMemo(() => {
    const counts: Record<string, number> = { All: products.length }
    products.forEach((p) => {
      const cat = p.category || 'Uncategorized'
      counts[cat] = (counts[cat] || 0) + 1
    })
    return counts
  }, [products])

  const categories = useMemo(() => Object.keys(categoriesWithCounts), [categoriesWithCounts])

  // Filtered products list
  const visibleProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        (selectedCategory === 'Uncategorized' ? !p.category : p.category === selectedCategory)

      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))

      return matchesCategory && matchesSearch
    })
  }, [products, selectedCategory, searchQuery])

  return (
    <div className="min-h-screen bg-[#091540] text-[#FFF9F2] font-sans selection:bg-[#F2842F] selection:text-[#FFF9F2]">
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-1/3 w-96 h-96 bg-[#F2842F]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-[#1e3073]/30 rounded-full blur-3xl pointer-events-none" />

      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/90 border-rose-500/40 text-rose-200'
            }`}
          >
            {toast.type === 'success' ? <FiCheck size={18} /> : <FiAlertCircle size={18} />}
            <span className="text-xs sm:text-sm font-semibold">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 opacity-60 hover:opacity-100 transition"
            >
              <FiX size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-[#0f1d4f]/90 backdrop-blur-md border-b border-[#1e3073] sticky top-0 z-30 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#F2842F] to-[#ff9e54] flex items-center justify-center font-bold text-lg text-[#FFF9F2] shadow-md shadow-[#F2842F]/20">
              S
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#FFF9F2]">
              Storefront
            </h1>
          </div>

          <Link
            href="/cart"
            className="flex items-center gap-2.5 px-4 py-2.5 bg-[#F2842F] hover:bg-[#e06d19] text-[#FFF9F2] font-semibold rounded-xl shadow-lg shadow-[#F2842F]/20 active:scale-95 transition-all text-xs sm:text-sm"
          >
            <FiShoppingCart size={18} />
            <span>Cart</span>
            <span className="px-2 py-0.5 bg-[#091540]/40 text-[#FFF9F2] rounded-full text-xs font-bold">
              {cartCount}
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Search & Category Filter Bar */}
        <div className="space-y-4">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FFF9F2]/40" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-[#0d1a45] border border-[#1e3073] rounded-xl text-[#FFF9F2] placeholder-[#FFF9F2]/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#F2842F]/40 focus:border-[#F2842F] transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#FFF9F2]/40 hover:text-[#FFF9F2]"
              >
                <FiX size={16} />
              </button>
            )}
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap border transition-all ${
                    isSelected
                      ? 'bg-[#F2842F] text-[#FFF9F2] border-[#F2842F] shadow-md shadow-[#F2842F]/15'
                      : 'bg-[#0d1a45] text-[#FFF9F2]/70 border-[#1e3073] hover:border-[#F2842F]/50 hover:text-[#FFF9F2]'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isSelected ? 'bg-[#091540]/30 text-[#FFF9F2]' : 'bg-[#15255e] text-[#FFF9F2]/60'
                    }`}
                  >
                    {categoriesWithCounts[cat]}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-[#0d1a45] border border-[#1e3073] p-5 rounded-2xl animate-pulse space-y-4"
              >
                <div className="w-full h-44 bg-[#15255e] rounded-xl" />
                <div className="h-4 bg-[#15255e] rounded w-3/4" />
                <div className="h-3 bg-[#15255e] rounded w-full" />
                <div className="flex justify-between items-center pt-2">
                  <div className="h-6 bg-[#15255e] rounded w-16" />
                  <div className="h-8 bg-[#15255e] rounded-xl w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="text-center py-16 px-6 bg-[#0d1a45]/80 rounded-3xl border border-[#1e3073] max-w-md mx-auto shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-[#15255e] text-[#F2842F] flex items-center justify-center mx-auto mb-4 border border-[#1e3073]">
              <FiPackage size={32} />
            </div>
            <h3 className="text-lg font-bold text-[#FFF9F2] mb-1">No products found</h3>
            <p className="text-xs sm:text-sm text-[#FFF9F2]/60 mb-6">
              Try adjusting your search query or selecting a different category filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('All')
              }}
              className="px-4 py-2 bg-[#15255e] hover:bg-[#1e3073] text-[#FFF9F2] font-semibold rounded-xl text-xs transition border border-[#1e3073]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleProducts.map((product) => {
              const outOfStock = product.stock <= 0

              return (
                <div
                  key={product.id}
                  className="bg-[#0d1a45] border border-[#1e3073] rounded-2xl p-5 flex flex-col justify-between hover:border-[#F2842F]/40 transition-all shadow-md group"
                >
                  <Link href={`/shop/${product.id}`} className="block">
                    {/* Product Image Thumbnail */}
                    <div className="w-full h-44 bg-[#0f1d4f] border border-[#1e3073] rounded-xl overflow-hidden mb-4 flex items-center justify-center text-[#FFF9F2]/30 group-hover:border-[#F2842F]/30 transition">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            ;(e.target as HTMLElement).style.display = 'none'
                          }}
                        />
                      ) : (
                        <FiPackage size={36} />
                      )}
                    </div>

                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h2 className="text-base font-bold text-[#FFF9F2] line-clamp-1">
                        {product.name}
                      </h2>
                      {outOfStock ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 whitespace-nowrap">
                          Out of stock
                        </span>
                      ) : product.stock <= 5 ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                          Only {product.stock} left
                        </span>
                      ) : null}
                    </div>

                    <span className="inline-block px-2.5 py-0.5 bg-[#15255e] text-[#FFF9F2]/70 border border-[#1e3073] rounded-md text-[11px] font-medium capitalize mb-3">
                      {product.category || 'Uncategorized'}
                    </span>

                    <p className="text-xs text-[#FFF9F2]/60 line-clamp-2 mb-6 leading-relaxed">
                      {product.description || 'No product description available.'}
                    </p>
                  </Link>

                  <div className="pt-4 border-t border-[#1e3073]/60 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#FFF9F2]/40 block tracking-wider">
                        Price
                      </span>
                      <span className="text-lg font-extrabold text-[#FFF9F2]">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={outOfStock}
                      className="px-4 py-2 bg-[#F2842F] hover:bg-[#e06d19] disabled:bg-[#15255e] disabled:text-[#FFF9F2]/40 disabled:border-[#1e3073] disabled:cursor-not-allowed text-[#FFF9F2] font-semibold rounded-xl text-xs transition shadow-md shadow-[#F2842F]/10 active:scale-95"
                    >
                      {outOfStock ? 'Sold Out' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}