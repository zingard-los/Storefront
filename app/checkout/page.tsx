'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CartItem, getCart, clearCart } from '@/lib/cart'
import { 
  FiArrowLeft, 
  FiLock, 
  FiUser, 
  FiMail, 
  FiPhone,
  FiMapPin,
  FiFileText,
  FiPackage, 
  FiShield, 
  FiAlertCircle, 
  FiLoader,
  FiShoppingBag,
  FiCheckCircle,
  FiTruck
} from 'react-icons/fi'

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    setCart(getCart())
    setLoaded(true)
  }, [])

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 0), 0)
  }, [cart])

  const totalItemsCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + (Number(item.qty) || 0), 0)
  }, [cart])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (cart.length === 0) {
      setError('Your cart is empty.')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          notes: notes.trim(),
          items: cart.map((item) => ({ id: item.id, qty: item.qty })),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong.')
      }

      clearCart()
      router.push(`/confirmation?order=${data.orderId}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#091540] text-[#FFF9F2] font-sans selection:bg-[#F2842F] selection:text-[#FFF9F2] relative overflow-x-hidden">
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-[#F2842F]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-[#1e3073]/30 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="bg-[#0f1d4f]/90 backdrop-blur-md border-b border-[#1e3073] sticky top-0 z-30 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/cart"
              className="p-2.5 text-[#FFF9F2]/70 hover:text-[#FFF9F2] bg-[#0d1a45] hover:bg-[#15255e] border border-[#1e3073] rounded-xl transition shadow-sm"
              title="Return to Cart"
            >
              <FiArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#FFF9F2]">
                Checkout
              </h1>
              <p className="text-xs text-[#FFF9F2]/60 hidden sm:block mt-0.5">
                Complete your delivery details to finalize your order
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-full shadow-sm">
            <FiShield size={16} />
            <span className="hidden sm:inline">256-Bit SSL Encrypted</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {!loaded ? (
          /* Loading State Skeleton */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 bg-[#0d1a45] border border-[#1e3073] p-6 sm:p-8 rounded-3xl animate-pulse space-y-6">
              <div className="h-6 bg-[#15255e] rounded-md w-1/3" />
              <div className="space-y-4">
                <div className="h-12 bg-[#15255e] rounded-xl w-full" />
                <div className="h-12 bg-[#15255e] rounded-xl w-full" />
                <div className="h-12 bg-[#15255e] rounded-xl w-full" />
              </div>
              <div className="h-12 bg-[#15255e] rounded-xl w-full mt-6" />
            </div>
            <div className="lg:col-span-5 bg-[#0d1a45] border border-[#1e3073] p-6 rounded-3xl animate-pulse space-y-4">
              <div className="h-6 bg-[#15255e] rounded-md w-1/2" />
              <div className="h-20 bg-[#15255e] rounded-2xl w-full" />
              <div className="h-12 bg-[#15255e] rounded-xl w-full" />
            </div>
          </div>
        ) : cart.length === 0 ? (
          /* Empty Cart Redirection State */
          <div className="text-center py-20 px-6 bg-[#0d1a45]/80 backdrop-blur-xl rounded-3xl border border-[#1e3073] max-w-md mx-auto shadow-2xl">
            <div className="w-20 h-20 rounded-3xl bg-[#15255e] text-[#F2842F] flex items-center justify-center mx-auto mb-5 border border-[#1e3073] shadow-lg">
              <FiShoppingBag size={36} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#FFF9F2] mb-2">Your cart is empty</h2>
            <p className="text-xs sm:text-sm text-[#FFF9F2]/60 mb-8 max-w-xs mx-auto leading-relaxed">
              Please add items to your shopping cart before proceeding to checkout.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#F2842F] to-[#e06d19] hover:from-[#f49852] hover:to-[#F2842F] text-[#FFF9F2] font-semibold rounded-xl text-sm transition shadow-lg shadow-[#F2842F]/20 active:scale-95"
            >
              Browse Products Catalog
            </Link>
          </div>
        ) : (
          /* Active Checkout Grid Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Delivery Form */}
            <div className="lg:col-span-7 space-y-6">
              <form onSubmit={handleSubmit} className="bg-[#0d1a45]/90 backdrop-blur-xl rounded-3xl border border-[#1e3073] p-6 sm:p-8 shadow-2xl space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#1e3073]/60">
                  <div>
                    <h2 className="text-lg font-bold text-[#FFF9F2]">Delivery details</h2>
                    <p className="text-xs text-[#FFF9F2]/60 mt-0.5">Please provide your shipping details for order fulfillment</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#15255e] text-[#F2842F] border border-[#1e3073]">
                    <FiTruck size={20} />
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-rose-950/80 border border-rose-500/50 rounded-2xl text-rose-200 text-xs sm:text-sm flex items-start gap-3 shadow-lg">
                    <FiAlertCircle size={20} className="text-rose-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{error}</span>
                  </div>
                )}

                {/* Name & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#FFF9F2]/80 uppercase tracking-wider">
                      Full name *
                    </label>
                    <div className="relative group">
                      <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FFF9F2]/40 group-focus-within:text-[#F2842F] transition-colors" size={18} />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Jane Doe"
                        required
                        className="w-full pl-11 pr-4 py-3 bg-[#091540]/70 border border-[#1e3073] rounded-xl text-[#FFF9F2] placeholder-[#FFF9F2]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#F2842F]/40 focus:border-[#F2842F] transition shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#FFF9F2]/80 uppercase tracking-wider">
                      Email *
                    </label>
                    <div className="relative group">
                      <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FFF9F2]/40 group-focus-within:text-[#F2842F] transition-colors" size={18} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="jane@example.com"
                        required
                        className="w-full pl-11 pr-4 py-3 bg-[#091540]/70 border border-[#1e3073] rounded-xl text-[#FFF9F2] placeholder-[#FFF9F2]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#F2842F]/40 focus:border-[#F2842F] transition shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                {/* Phone & City Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#FFF9F2]/80 uppercase tracking-wider">
                      Phone number *
                    </label>
                    <div className="relative group">
                      <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FFF9F2]/40 group-focus-within:text-[#F2842F] transition-colors" size={18} />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 08012345678"
                        required
                        className="w-full pl-11 pr-4 py-3 bg-[#091540]/70 border border-[#1e3073] rounded-xl text-[#FFF9F2] placeholder-[#FFF9F2]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#F2842F]/40 focus:border-[#F2842F] transition shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#FFF9F2]/80 uppercase tracking-wider">
                      City *
                    </label>
                    <div className="relative group">
                      <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FFF9F2]/40 group-focus-within:text-[#F2842F] transition-colors" size={18} />
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Lagos"
                        required
                        className="w-full pl-11 pr-4 py-3 bg-[#091540]/70 border border-[#1e3073] rounded-xl text-[#FFF9F2] placeholder-[#FFF9F2]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#F2842F]/40 focus:border-[#F2842F] transition shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#FFF9F2]/80 uppercase tracking-wider">
                    Delivery address *
                  </label>
                  <div className="relative group">
                    <FiMapPin className="absolute left-4 top-3.5 text-[#FFF9F2]/40 group-focus-within:text-[#F2842F] transition-colors" size={18} />
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={2}
                      placeholder="Street address, house number, apartment, suite..."
                      required
                      className="w-full pl-11 pr-4 py-3 bg-[#091540]/70 border border-[#1e3073] rounded-xl text-[#FFF9F2] placeholder-[#FFF9F2]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#F2842F]/40 focus:border-[#F2842F] transition shadow-inner resize-none"
                    />
                  </div>
                </div>

                {/* Order Notes */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#FFF9F2]/80 uppercase tracking-wider">
                    Order notes <span className="text-[#FFF9F2]/40 font-normal">(optional)</span>
                  </label>
                  <div className="relative group">
                    <FiFileText className="absolute left-4 top-3.5 text-[#FFF9F2]/40 group-focus-within:text-[#F2842F] transition-colors" size={18} />
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      placeholder="Size, colour, or delivery instructions"
                      className="w-full pl-11 pr-4 py-3 bg-[#091540]/70 border border-[#1e3073] rounded-xl text-[#FFF9F2] placeholder-[#FFF9F2]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#F2842F]/40 focus:border-[#F2842F] transition shadow-inner resize-none"
                    />
                  </div>
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 px-6 bg-gradient-to-r from-[#F2842F] to-[#e06d19] hover:from-[#f49852] hover:to-[#F2842F] disabled:opacity-50 disabled:pointer-events-none text-[#FFF9F2] text-sm font-bold rounded-xl shadow-xl shadow-[#F2842F]/20 transition-all flex items-center justify-center gap-2 active:scale-98 mt-4"
                >
                  {submitting ? (
                    <>
                      <FiLoader className="animate-spin" size={18} />
                      <span>Placing order...</span>
                    </>
                  ) : (
                    <>
                      <FiLock size={16} />
                      <span>Place order &bull; ${total.toFixed(2)}</span>
                    </>
                  )}
                </button>

                <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-[#FFF9F2]/50">
                  <FiCheckCircle className="text-emerald-400" size={14} />
                  <span>An order receipt will be sent directly to your email address</span>
                </div>
              </form>
            </div>

            {/* Right Column: Order Summary Card */}
            <div className="lg:col-span-5 bg-[#0d1a45]/90 backdrop-blur-xl rounded-3xl border border-[#1e3073] p-6 sm:p-8 shadow-2xl sticky top-24 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#1e3073]/60">
                <h2 className="text-lg font-bold text-[#FFF9F2]">Order summary</h2>
                <span className="px-3 py-1 bg-[#15255e] text-[#F2842F] border border-[#1e3073] rounded-full text-xs font-semibold">
                  {totalItemsCount} {totalItemsCount === 1 ? 'Item' : 'Items'}
                </span>
              </div>

              {/* Line Items List */}
              <div className="max-h-72 overflow-y-auto pr-1 space-y-3 divide-y divide-[#1e3073]/40">
                {cart.map((item) => (
                  <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs sm:text-sm">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-[#0f1d4f] border border-[#1e3073] flex items-center justify-center text-[#FFF9F2]/40 shrink-0">
                        <FiPackage size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[#FFF9F2] truncate">{item.name}</p>
                        <p className="text-[11px] text-[#FFF9F2]/50">
                          Qty: {item.qty} &times; ${(Number(item.price) || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-[#FFF9F2] shrink-0">
                      ${((Number(item.price) || 0) * (Number(item.qty) || 0)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Grand Total Footer */}
              <div className="pt-4 border-t border-[#1e3073]/60 space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-base font-bold text-[#FFF9F2]">Total</span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#FFF9F2]">${total.toFixed(2)}</span>
                </div>
                <p className="text-[11px] text-[#FFF9F2]/40">
                  Includes all applicable taxes and fulfillment fees.
                </p>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  )
}