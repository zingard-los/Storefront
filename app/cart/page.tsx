'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { CartItem, getCart, updateQuantity, removeFromCart } from '@/lib/cart'
import { 
  FiArrowLeft, 
  FiTrash2, 
  FiPlus, 
  FiMinus, 
  FiShoppingBag, 
  FiArrowRight, 
  FiShield, 
  FiPackage 
} from 'react-icons/fi'

// Theme Palette Configuration
const theme = {
  Orange: "#F2842F",
  White: "#FFF9F2",
  Darkblue: "#091540",
} as const;

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [loaded, setLoaded] = useState(false)

  // Sync cart with localStorage / state events
  useEffect(() => {
    const refresh = () => setCart(getCart())
    refresh()
    setLoaded(true)
    window.addEventListener('cart-updated', refresh)
    return () => window.removeEventListener('cart-updated', refresh)
  }, [])

  // Calculated totals
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 0), 0)
  }, [cart])

  const totalItemsCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + (Number(item.qty) || 0), 0)
  }, [cart])

  const estimatedShipping = subtotal > 0 ? (subtotal > 100 ? 0 : 15) : 0
  const grandTotal = subtotal + estimatedShipping

  return (
    <div className="min-h-screen bg-[#091540] text-[#FFF9F2] font-sans selection:bg-[#F2842F] selection:text-[#FFF9F2]">
      {/* Ambient Background Mesh Glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-[#F2842F]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-[#1e3073]/30 rounded-full blur-3xl pointer-events-none" />

      {/* Sticky Header */}
      <header className="bg-[#0f1d4f]/90 backdrop-blur-md border-b border-[#1e3073] sticky top-0 z-30 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/shop"
              className="p-2.5 text-[#FFF9F2]/70 hover:text-[#FFF9F2] bg-[#0d1a45] hover:bg-[#15255e] border border-[#1e3073] rounded-xl transition"
              title="Continue Shopping"
            >
              <FiArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#FFF9F2]">
                Your Shopping Cart
              </h1>
              <p className="text-xs text-[#FFF9F2]/60 hidden sm:block mt-0.5">
                Review your items before proceeding to secure checkout
              </p>
            </div>
          </div>

          <span className="px-3 py-1 bg-[#15255e] border border-[#1e3073] text-[#F2842F] rounded-full text-xs font-semibold">
            {totalItemsCount} {totalItemsCount === 1 ? 'Item' : 'Items'}
          </span>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!loaded ? (
          /* Loading Skeleton View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[#0d1a45] border border-[#1e3073] p-5 rounded-2xl animate-pulse flex gap-4">
                  <div className="w-20 h-20 bg-[#15255e] rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[#15255e] rounded w-1/2" />
                    <div className="h-3 bg-[#15255e] rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-[#0d1a45] border border-[#1e3073] p-6 rounded-2xl h-64 animate-pulse space-y-4">
              <div className="h-5 bg-[#15255e] rounded w-1/3" />
              <div className="h-4 bg-[#15255e] rounded w-full" />
              <div className="h-10 bg-[#15255e] rounded-xl w-full mt-auto" />
            </div>
          </div>
        ) : cart.length === 0 ? (
          /* Empty Cart State */
          <div className="text-center py-20 px-6 bg-[#0d1a45]/80 rounded-3xl border border-[#1e3073] max-w-md mx-auto shadow-xl">
            <div className="w-20 h-20 rounded-3xl bg-[#15255e] text-[#F2842F] flex items-center justify-center mx-auto mb-5 border border-[#1e3073]">
              <FiShoppingBag size={36} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#FFF9F2] mb-2">Your cart is empty</h2>
            <p className="text-xs sm:text-sm text-[#FFF9F2]/60 mb-8 max-w-xs mx-auto leading-relaxed">
              Looks like you haven't added any products to your bag yet. Explore our storefront catalog to find great items!
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#F2842F] hover:bg-[#e06d19] text-[#FFF9F2] font-semibold rounded-xl text-sm transition shadow-lg shadow-[#F2842F]/20 active:scale-95"
            >
              <span>Explore Products</span>
              <FiArrowRight size={18} />
            </Link>
          </div>
        ) : (
          /* Active Cart Grid View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-[#0d1a45] rounded-2xl border border-[#1e3073] overflow-hidden shadow-xl divide-y divide-[#1e3073]/60">
                {cart.map((item) => {
                  const itemTotal = (Number(item.price) || 0) * (Number(item.qty) || 0)

                  return (
                    <div
                      key={item.id}
                      className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#13235b]/40 transition-colors group"
                    >
                      {/* Product Metadata */}
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#0f1d4f] border border-[#1e3073] overflow-hidden shrink-0 flex items-center justify-center text-[#FFF9F2]/30 group-hover:border-[#F2842F]/40 transition">
                          <FiPackage size={28} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-[#FFF9F2] text-sm sm:text-base line-clamp-1">
                            {item.name}
                          </h3>
                          <p className="text-xs text-[#FFF9F2]/50 mt-0.5">
                            ${(Number(item.price) || 0).toFixed(2)} each
                          </p>
                        </div>
                      </div>

                      {/* Quantity Selector & Item Subtotal */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[#1e3073]/40">
                        {/* Quantity Counter Buttons */}
                        <div className="flex items-center bg-[#091540] border border-[#1e3073] rounded-xl p-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.qty - 1)}
                            className="w-7 h-7 rounded-lg bg-[#15255e] hover:bg-[#1e3073] text-[#FFF9F2] flex items-center justify-center transition active:scale-95 disabled:opacity-40"
                            aria-label="Decrease quantity"
                          >
                            <FiMinus size={14} />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-[#FFF9F2]">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.qty + 1)}
                            className="w-7 h-7 rounded-lg bg-[#15255e] hover:bg-[#1e3073] text-[#FFF9F2] flex items-center justify-center transition active:scale-95"
                            aria-label="Increase quantity"
                          >
                            <FiPlus size={14} />
                          </button>
                        </div>

                        {/* Price Subtotal */}
                        <div className="text-right min-w-[80px]">
                          <span className="text-xs uppercase font-bold text-[#FFF9F2]/40 block sm:hidden">Total</span>
                          <span className="text-base font-extrabold text-[#FFF9F2]">
                            ${itemTotal.toFixed(2)}
                          </span>
                        </div>

                        {/* Remove Action Button */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition border border-transparent hover:border-rose-500/30"
                          title="Remove item"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Navigation Back Link */}
              <div className="flex items-center justify-between pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#F2842F] hover:text-[#ff9e54] transition"
                >
                  <FiArrowLeft size={16} />
                  <span>Add more items from shop</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Order Summary Card */}
            <div className="bg-[#0d1a45] rounded-2xl border border-[#1e3073] p-6 shadow-xl sticky top-24 space-y-6">
              <h2 className="text-lg font-bold text-[#FFF9F2] pb-3 border-b border-[#1e3073]/60">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-[#FFF9F2]/70">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#FFF9F2]">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#FFF9F2]/70">
                  <span>Estimated Shipping</span>
                  <span className="font-semibold text-[#FFF9F2]">
                    {estimatedShipping === 0 ? (
                      <span className="text-emerald-400 uppercase text-xs font-bold">Free</span>
                    ) : (
                      `$${estimatedShipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                {subtotal > 0 && subtotal <= 100 && (
                  <p className="text-[11px] text-[#FFF9F2]/40">
                    Add ${(100 - subtotal).toFixed(2)} more to qualify for Free Shipping.
                  </p>
                )}
                
                <div className="pt-3 border-t border-[#1e3073]/60 flex justify-between items-baseline">
                  <span className="text-base font-bold text-[#FFF9F2]">Total</span>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-[#FFF9F2] block">
                      ${grandTotal.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-[#FFF9F2]/40">Taxes calculated at checkout</span>
                  </div>
                </div>
              </div>

              {/* Checkout Action Button */}
              <Link
                href="/checkout"
                className="w-full py-3.5 px-6 bg-gradient-to-r from-[#F2842F] to-[#e06d19] hover:from-[#f49852] hover:to-[#F2842F] text-[#FFF9F2] font-semibold rounded-xl text-sm transition shadow-lg shadow-[#F2842F]/20 flex items-center justify-center gap-2 active:scale-98"
              >
                <span>Proceed to Checkout</span>
                <FiArrowRight size={18} />
              </Link>

              {/* Guarantee Badge */}
              <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-[#FFF9F2]/40">
                <FiShield className="text-emerald-400" size={14} />
                <span>Encrypted 256-Bit SSL Checkout</span>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  )
}