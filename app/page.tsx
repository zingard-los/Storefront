'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { addToCart } from '@/lib/cart'
import { 
  FiShoppingBag, 
  FiUser, 
  FiLogOut, 
  FiLogIn, 
  FiUserPlus, 
  FiArrowRight, 
  FiShield, 
  FiTruck, 
  FiClock, 
  FiStar,
  FiCheckCircle,
  FiChevronRight,
  FiPackage,
  FiChevronDown,
  FiTrendingUp,
  FiHelpCircle
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

export default function LandingPage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    // Auth session check
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user.email ?? null)
      setChecked(true)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user.email ?? null)
      setChecked(true)
    })

    fetchFeaturedProducts()

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  // Fetch top 3 featured products from Supabase
  const fetchFeaturedProducts = async () => {
    try {
      setLoadingProducts(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .gt('stock', 0)
        .limit(3)

      if (!error && data) {
        setFeaturedProducts(
          data.map((p) => ({
            ...p,
            price: Number(p.price) || 0,
            stock: Number(p.stock) || 0,
          }))
        )
      }
    } catch (err) {
      console.error('Error fetching featured products:', err)
    } finally {
      setLoadingProducts(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUserEmail(null)
    router.refresh()
  }

  // Session guard for shop links
  const handleShopRedirect = async (categoryFilter?: string) => {
    const { data } = await supabase.auth.getSession()
    const targetPath = categoryFilter ? `/shop?category=${encodeURIComponent(categoryFilter)}` : '/shop'
    
    if (data.session) {
      router.push(targetPath)
    } else {
      router.push(`/register?redirect=${encodeURIComponent(targetPath)}`)
    }
  }

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation()
    const added = addToCart(
      { id: product.id, name: product.name, price: product.price },
      product.stock
    )
    if (added) {
      showToast(`Added ${product.name} to cart!`)
    } else {
      showToast(`Out of stock!`)
    }
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const faqs = [
    {
      q: 'Do I need an account to browse and shop?',
      a: 'Browsing is free for everyone! Creating an account allows you to track order statuses, manage shipping history, and enjoy faster future checkouts.'
    },
    {
      q: 'How fast will my order be processed and shipped?',
      a: 'Orders placed before 2 PM are processed the same day. Standard doorstep shipping usually takes between 2 to 4 business days.'
    },
    {
      q: 'Are payment transactions secure?',
      a: 'Yes, all orders are processed using end-to-end 256-bit SSL encryption. We never store raw payment details on our servers.'
    },
    {
      q: 'What is the return policy?',
      a: 'We offer a hassle-free 30-day return guarantee on all eligible unopened and non-perishable items.'
    }
  ]

  return (
    <div className="min-h-screen bg-[#091540] text-[#FFF9F2] font-sans selection:bg-[#F2842F] selection:text-[#FFF9F2] flex flex-col relative overflow-x-hidden">
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#F2842F]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-[#1e3073]/30 rounded-full blur-3xl pointer-events-none" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#F2842F] text-[#FFF9F2] px-4 py-3 rounded-xl shadow-2xl font-semibold text-xs sm:text-sm flex items-center gap-2 animate-bounce">
          <FiCheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <header className="bg-[#0f1d4f]/90 backdrop-blur-md border-b border-[#1e3073] sticky top-0 z-30 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#F2842F] to-[#ff9e54] flex items-center justify-center font-bold text-xl text-[#FFF9F2] shadow-md shadow-[#F2842F]/20 group-hover:scale-105 transition-transform">
              S
            </div>
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#FFF9F2]">
              Shop<span className="text-[#F2842F]">Front</span>
            </span>
          </Link>

          {checked && userEmail ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0d1a45] border border-[#1e3073] text-xs font-semibold text-[#FFF9F2]/80">
                <FiUser className="text-[#F2842F]" size={14} />
                <span className="max-w-[160px] truncate">{userEmail}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#FFF9F2]/80 hover:text-[#FFF9F2] bg-[#0d1a45] hover:bg-[#15255e] border border-[#1e3073] hover:border-[#F2842F]/40 rounded-xl transition flex items-center gap-1.5 shadow-sm"
              >
                <FiLogOut size={16} />
                <span className="hidden xs:inline">Sign out</span>
              </button>
            </div>
          ) : (
            checked && (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-xs  text-[#FFF9F2]/80 hover:text-[#FFF9F2] bg-[#0d1a45] hover:bg-[#15255e] border border-[#1e3073] rounded-xl transition flex items-center gap-1.5"
                >
                  <FiLogIn size={12} />
                  <span>Sign in</span>
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-[#FFF9F2] bg-gradient-to-r from-[#F2842F] to-[#e06d19] hover:from-[#f49852] hover:to-[#F2842F] rounded-xl shadow-lg shadow-[#F2842F]/20 transition flex items-center gap-1.5 active:scale-95"
                >
                  <FiUserPlus size={15} />
                  <span className="hidden xs:inline">Create account</span>
                </Link>
              </div>
            )
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 space-y-16 sm:space-y-24 pb-16">
        
        {/* 1. Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 text-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0d1a45] border border-[#1e3073] text-xs font-semibold text-[#F2842F] mb-6 shadow-lg shadow-[#F2842F]/5">
            <FiStar className="fill-[#F2842F]" size={14} />
            <span>Premium E-Commerce Experience</span>
            <FiChevronRight size={14} className="opacity-70" />
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-[#FFF9F2] tracking-tight leading-tight max-w-4xl mx-auto mb-6">
            Everything you need, delivered with total confidence
          </h1>

          <p className="text-sm sm:text-lg text-[#FFF9F2]/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover thousands of handpicked products with live inventory tracking, fast doorstep shipping, and end-to-end encrypted checkout.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
            <button
              onClick={() => handleShopRedirect()}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#F2842F] to-[#e06d19] hover:from-[#f49852] hover:to-[#F2842F] text-[#FFF9F2] font-bold rounded-xl text-sm sm:text-base transition shadow-xl shadow-[#F2842F]/20 flex items-center justify-center gap-2 active:scale-95 group cursor-pointer"
            >
              <FiShoppingBag size={18} />
              <span>Browse Products</span>
              <FiArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>

            {checked && !userEmail ? (
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 bg-[#0d1a45] hover:bg-[#15255e] border border-[#1e3073] hover:border-[#F2842F]/40 text-[#FFF9F2] font-bold rounded-xl text-sm sm:text-base transition flex items-center justify-center gap-2 shadow-md"
              >
                <span>Create an Account</span>
              </Link>
            ) : (
              <button
                onClick={() => handleShopRedirect()}
                className="w-full sm:w-auto px-8 py-4 bg-[#0d1a45] hover:bg-[#15255e] border border-[#1e3073] hover:border-[#F2842F]/40 text-[#FFF9F2] font-bold rounded-xl text-sm sm:text-base transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <span>Go to Shop</span>
              </button>
            )}
          </div>

          {/* Metrics Counter */}
          <div className="mt-14 pt-10 border-t border-[#1e3073]/60 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="p-4 bg-[#0d1a45]/60 rounded-2xl border border-[#1e3073]">
              <p className="text-2xl sm:text-3xl font-extrabold text-[#F2842F]">100%</p>
              <p className="text-xs text-[#FFF9F2]/60 mt-1">Verified Genuine Items</p>
            </div>
            <div className="p-4 bg-[#0d1a45]/60 rounded-2xl border border-[#1e3073]">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">24/7</p>
              <p className="text-xs text-[#FFF9F2]/60 mt-1">Order Fulfillment</p>
            </div>
            <div className="p-4 bg-[#0d1a45]/60 rounded-2xl border border-[#1e3073]">
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-400">2-4 Days</p>
              <p className="text-xs text-[#FFF9F2]/60 mt-1">Express Shipping</p>
            </div>
            <div className="p-4 bg-[#0d1a45]/60 rounded-2xl border border-[#1e3073]">
              <p className="text-2xl sm:text-3xl font-extrabold text-[#FFF9F2]">256-Bit</p>
              <p className="text-xs text-[#FFF9F2]/60 mt-1">SSL Encrypted Checkout</p>
            </div>
          </div>
        </section>

        {/* 2. Featured Catalog Preview */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#F2842F] uppercase tracking-wider mb-1">
                <FiTrendingUp size={14} />
                <span>Trending Right Now</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#FFF9F2]">Featured Products</h2>
            </div>
            <button
              onClick={() => handleShopRedirect()}
              className="text-xs sm:text-sm font-semibold text-[#F2842F] hover:text-[#ff9e54] flex items-center gap-1 transition"
            >
              <span>View All Catalog Items</span>
              <FiArrowRight size={16} />
            </button>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[#0d1a45] border border-[#1e3073] rounded-3xl p-5 animate-pulse space-y-4">
                  <div className="h-44 bg-[#15255e] rounded-2xl" />
                  <div className="h-5 bg-[#15255e] rounded w-2/3" />
                  <div className="h-4 bg-[#15255e] rounded w-full" />
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {featuredProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleShopRedirect()}
                  className="bg-[#0d1a45] border border-[#1e3073] rounded-3xl p-5 hover:border-[#F2842F]/50 transition duration-300 shadow-xl cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-full h-44 bg-[#0f1d4f] border border-[#1e3073] rounded-2xl overflow-hidden mb-4 flex items-center justify-center text-[#FFF9F2]/30 group-hover:border-[#F2842F]/30 transition">
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <FiPackage size={40} />
                      )}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#F2842F] bg-[#F2842F]/10 px-2.5 py-1 rounded-md border border-[#F2842F]/20">
                      {p.category || 'General'}
                    </span>
                    <h3 className="text-base font-bold text-[#FFF9F2] mt-2 group-hover:text-[#F2842F] transition">
                      {p.name}
                    </h3>
                    <p className="text-xs text-[#FFF9F2]/60 line-clamp-2 mt-1 leading-relaxed">
                      {p.description || 'High-quality item ready for express dispatch.'}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#1e3073]/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#FFF9F2]/40 block font-bold uppercase">Price</span>
                      <span className="text-lg font-extrabold text-[#FFF9F2]">${p.price.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={(e) => handleAddToCart(p, e)}
                      className="px-3.5 py-2 bg-[#F2842F] hover:bg-[#e06d19] text-[#FFF9F2] rounded-xl text-xs font-semibold shadow-md transition active:scale-95"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-[#0d1a45] rounded-3xl border border-[#1e3073]">
              <FiPackage className="mx-auto text-[#F2842F] mb-2" size={32} />
              <p className="text-sm font-semibold text-[#FFF9F2]/80">Store catalog is updating...</p>
            </div>
          )}
        </section>

        {/* 3. Value Proposition Features */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#FFF9F2]">Why Shop With Us?</h2>
            <p className="text-xs sm:text-sm text-[#FFF9F2]/60 mt-2">
              We focus on delivering seamless e-commerce experience from catalog browsing to package unboxing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                icon: FiShield, 
                title: 'Quality Assured Products', 
                text: 'Every product listed in our inventory undergoes quality checks with complete specification transparency.' 
              },
              { 
                icon: FiTruck, 
                title: 'Seamless Order Fulfillment', 
                text: 'Integrated stock reservation and automated warehouse tracking ensure your items ship out rapidly.' 
              },
              { 
                icon: FiClock, 
                title: 'Real-Time Order Updates', 
                text: 'Stay informed with instant email confirmation logs and status progression on your order dashboard.' 
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div 
                  key={item.title} 
                  className="bg-[#0d1a45]/80 backdrop-blur-xl rounded-3xl border border-[#1e3073] p-6 sm:p-8 hover:border-[#F2842F]/40 transition duration-300 shadow-xl group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#15255e] text-[#F2842F] border border-[#1e3073] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-md">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-[#FFF9F2] mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-[#FFF9F2]/60 leading-relaxed">{item.text}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* 4. Frequently Asked Questions (FAQ) */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F2842F] uppercase tracking-wider mb-1">
              <FiHelpCircle size={14} />
              <span>Got Questions?</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#FFF9F2]">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div
                  key={idx}
                  className="bg-[#0d1a45] border border-[#1e3073] rounded-2xl overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex justify-between items-center gap-4 hover:bg-[#13235b]/50 transition"
                  >
                    <span className="font-semibold text-sm sm:text-base text-[#FFF9F2]">{faq.q}</span>
                    <FiChevronDown
                      size={18}
                      className={`text-[#F2842F] shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-[#FFF9F2]/70 leading-relaxed border-t border-[#1e3073]/40 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* 5. Call-to-Action Banner */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#0d1a45] via-[#15255e] to-[#0d1a45] rounded-3xl border border-[#1e3073] p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl space-y-6">
            <div className="max-w-2xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#FFF9F2] tracking-tight">
                Ready to find what you're looking for?
              </h2>
              <p className="text-xs sm:text-sm text-[#FFF9F2]/70 leading-relaxed">
                Explore our full store catalog now to discover high-quality products curated just for you.
              </p>
            </div>
            
            <button
              onClick={() => handleShopRedirect()}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#F2842F] hover:bg-[#e06d19] text-[#FFF9F2] font-bold rounded-xl text-sm transition shadow-lg shadow-[#F2842F]/20 active:scale-95 cursor-pointer"
            >
              <FiShoppingBag size={18} />
              <span>Start Shopping Now</span>
            </button>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-[#0f1d4f]/80 border-t border-[#1e3073] py-8 text-center text-xs text-[#FFF9F2]/50 relative z-10 space-y-2">
        <p>&copy; {new Date().getFullYear()} Our Store. All rights reserved.</p>
        <p className="text-[11px] text-[#FFF9F2]/30">Crafted with high-precision design & performance.</p>
      </footer>
    </div>
  )
}