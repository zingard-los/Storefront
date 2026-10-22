'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { addToCart } from '@/lib/cart'
import { FiArrowLeft, FiPackage, FiCheck, FiAlertCircle } from 'react-icons/fi'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  category: string | null
  image_url: string | null
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .maybeSingle()

        if (error) {
          console.error('Error fetching product:', error)
          setNotFound(true)
        } else if (!data) {
          setNotFound(true)
        } else {
          setProduct({
            ...data,
            price: Number(data.price) || 0,
            stock: Number(data.stock) || 0,
          })
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  const handleAddToCart = () => {
    if (!product) return

    const added = addToCart(
      { id: product.id, name: product.name, price: product.price },
      product.stock
    )

    setToast(
      added
        ? { message: `Added ${product.name} to cart`, type: 'success' }
        : { message: `No more ${product.name} available in stock`, type: 'error' }
    )
    setTimeout(() => setToast(null), 3000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#091540] text-[#FFF9F2] flex items-center justify-center">
        Loading product...
      </div>
    )
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-[#091540] text-[#FFF9F2] flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-lg">This product could not be found.</p>
        <Link href="/shop" className="text-[#F2842F] font-semibold">
          ← Back to shop
        </Link>
      </div>
    )
  }

  const outOfStock = product.stock <= 0

  return (
    <div className="min-h-screen bg-[#091540] text-[#FFF9F2] font-sans">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/90 border-rose-500/40 text-rose-200'
            }`}
          >
            {toast.type === 'success' ? <FiCheck size={18} /> : <FiAlertCircle size={18} />}
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
        </div>
      )}

      <header className="bg-[#0f1d4f]/90 border-b border-[#1e3073] sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link
            href="/shop"
            className="flex items-center gap-2 text-[#FFF9F2]/70 hover:text-[#FFF9F2] text-sm font-semibold"
          >
            <FiArrowLeft size={18} />
            Back to shop
          </Link>
          <Link
            href="/cart"
            className="px-4 py-2 bg-[#F2842F] hover:bg-[#e06d19] rounded-xl font-semibold text-sm"
          >
            View cart
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Image */}
          <div className="bg-[#0d1a45] border border-[#1e3073] rounded-2xl overflow-hidden aspect-square flex items-center justify-center">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <FiPackage size={64} className="text-[#FFF9F2]/30" />
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <span className="inline-block w-fit px-2.5 py-0.5 bg-[#15255e] text-[#FFF9F2]/70 border border-[#1e3073] rounded-md text-xs font-medium capitalize mb-4">
              {product.category || 'Uncategorized'}
            </span>

            <h1 className="text-3xl font-extrabold tracking-tight mb-3">{product.name}</h1>

            <p className="text-3xl font-extrabold text-[#F2842F] mb-4">
              ${product.price.toFixed(2)}
            </p>

            <p className="text-sm mb-6">
              {outOfStock ? (
                <span className="text-rose-300 font-semibold">Out of stock</span>
              ) : product.stock <= 5 ? (
                <span className="text-amber-300 font-semibold">Only {product.stock} left</span>
              ) : (
                <span className="text-emerald-300 font-semibold">In stock</span>
              )}
            </p>

            <p className="text-[#FFF9F2]/70 leading-relaxed mb-8 whitespace-pre-line">
              {product.description || 'No product description available.'}
            </p>

            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              className="px-6 py-3 bg-[#F2842F] hover:bg-[#e06d19] disabled:bg-[#15255e] disabled:text-[#FFF9F2]/40 disabled:cursor-not-allowed rounded-xl font-bold transition active:scale-95"
            >
              {outOfStock ? 'Sold Out' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}