'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  FiShoppingBag, 
  FiMail, 
  FiShield, 
  FiTruck, 
  FiRefreshCw, 
  FiCheck, 
  FiArrowRight, 
  FiPhone, 
  FiMapPin 
} from 'react-icons/fi'

export default function Footer() {
  const router = useRouter()
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  // Handle protected navigation routing
  const handleShopRedirect = async (categoryFilter?: string) => {
    const { data } = await supabase.auth.getSession()
    const targetPath = categoryFilter ? `/shop?category=${encodeURIComponent(categoryFilter)}` : '/shop'

    if (data.session) {
      router.push(targetPath)
    } else {
      router.push(`/register?redirect=${encodeURIComponent(targetPath)}`)
    }
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsletterEmail.trim()) return
    setSubscribed(true)
    setNewsletterEmail('')
    setTimeout(() => setSubscribed(false), 4000)
  }

  return (
    <footer className="bg-[#0f1d4f]/95 border-t border-[#1e3073] text-[#FFF9F2] font-sans relative overflow-hidden z-20">
      
      {/* Background Ambient Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-64 bg-[#F2842F]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Trust Badges Top Bar */}
      <div className="border-b border-[#1e3073]/80 bg-[#0d1a45]/60 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#15255e] border border-[#1e3073] flex items-center justify-center text-[#F2842F] shrink-0">
              <FiTruck size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#FFF9F2]">Express Shipping</h4>
              <p className="text-xs text-[#FFF9F2]/60 mt-0.5">Fast doorstep delivery on all orders</p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#15255e] border border-[#1e3073] flex items-center justify-center text-emerald-400 shrink-0">
              <FiShield size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#FFF9F2]">256-Bit SSL Protection</h4>
              <p className="text-xs text-[#FFF9F2]/60 mt-0.5">End-to-end encrypted checkout</p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#15255e] border border-[#1e3073] flex items-center justify-center text-blue-400 shrink-0">
              <FiRefreshCw size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#FFF9F2]">30-Day Guarantee</h4>
              <p className="text-xs text-[#FFF9F2]/60 mt-0.5">Hassle-free return policy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Column 1: Brand Info & Bio (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#F2842F] to-[#ff9e54] flex items-center justify-center font-bold text-xl text-[#FFF9F2] shadow-md shadow-[#F2842F]/20 group-hover:scale-105 transition-transform">
                S
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-[#FFF9F2]">
                Shop<span className="text-[#F2842F]">Front</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-[#FFF9F2]/60 leading-relaxed max-w-sm">
              Your premium destination for curated, high-quality products. Built with real-time stock management, transparent pricing, and instant order tracking.
            </p>

            <div className="space-y-2 pt-2 text-xs text-[#FFF9F2]/70">
              <div className="flex items-center gap-2">
                <FiMapPin className="text-[#F2842F] shrink-0" size={14} />
                <span>100 Commerce Boulevard, Suite 400</span>
              </div>
              <div className="flex items-center gap-2">
                <FiPhone className="text-[#F2842F] shrink-0" size={14} />
                <span>+1 (800) 555-STORE</span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Navigation Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#FFF9F2] pb-1 border-b border-[#1e3073]">
              Store Navigation
            </h3>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <button 
                  onClick={() => handleShopRedirect()} 
                  className="text-[#FFF9F2]/70 hover:text-[#F2842F] transition flex items-center gap-1"
                >
                  <FiShoppingBag size={12} /> Storefront
                </button>
              </li>
              <li>
                <Link href="/cart" className="text-[#FFF9F2]/70 hover:text-[#F2842F] transition">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="text-[#FFF9F2]/70 hover:text-[#F2842F] transition">
                  Secure Checkout
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-[#FFF9F2]/70 hover:text-[#F2842F] transition">
                  Order Management
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Popular Categories (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#FFF9F2] pb-1 border-b border-[#1e3073]">
              Categories
            </h3>
            <ul className="space-y-2 text-xs font-semibold">
              {['Electronics', 'Apparel', 'Home & Living', 'Accessories'].map((category) => (
                <li key={category}>
                  <button 
                    onClick={() => handleShopRedirect(category)}
                    className="text-[#FFF9F2]/70 hover:text-[#F2842F] transition text-left"
                  >
                    {category}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter Box (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#FFF9F2] pb-1 border-b border-[#1e3073]">
              Stay Informed
            </h3>
            <p className="text-xs text-[#FFF9F2]/60 leading-relaxed">
              Subscribe to get exclusive catalog drop alerts, flash sales, and restock notifications directly to your inbox.
            </p>

            {subscribed ? (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-semibold rounded-xl flex items-center gap-2">
                <FiCheck size={16} />
                <span>Thank you! You've been added to our list.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FFF9F2]/40" size={16} />
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email..."
                    required
                    className="w-full pl-10 pr-12 py-2.5 bg-[#0d1a45] border border-[#1e3073] rounded-xl text-[#FFF9F2] placeholder-[#FFF9F2]/30 text-xs focus:outline-none focus:ring-1 focus:ring-[#F2842F] focus:border-[#F2842F] transition"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-[#F2842F] hover:bg-[#e06d19] text-[#FFF9F2] rounded-lg transition active:scale-95 shadow-md"
                    title="Subscribe"
                  >
                    <FiArrowRight size={14} />
                  </button>
                </div>
                <span className="text-[10px] text-[#FFF9F2]/40 block">No spam ever. Unsubscribe at any time.</span>
              </form>
            )}
          </div>

        </div>
      </div>

      {/* Copyright & Legal Bar */}
      <div className="border-t border-[#1e3073]/80 py-6 px-4 sm:px-6 lg:px-8 text-xs text-[#FFF9F2]/50 bg-[#0d1a45]/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} ShopFront E-Commerce. All rights reserved.</p>
          
          <div className="flex items-center gap-6 text-[11px]">
            <Link href="/" className="hover:text-[#FFF9F2] transition">Privacy Policy</Link>
            <Link href="/" className="hover:text-[#FFF9F2] transition">Terms of Service</Link>
            <Link href="/" className="hover:text-[#FFF9F2] transition">Fulfillment FAQ</Link>
          </div>
        </div>
      </div>

    </footer>
  )
}