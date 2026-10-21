'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { 
  FiCheckCircle, 
  FiShoppingBag, 
  FiArrowRight, 
  FiPackage, 
  FiCopy, 
  FiCheck,
  FiMail,
  
} from 'react-icons/fi'
import { useState } from 'react'

function ConfirmationContent() {
  const params = useSearchParams()
  const orderId = params.get('order')
  const [copied, setCopied] = useState(false)

  const handleCopyId = () => {
    if (!orderId) return
    navigator.clipboard.writeText(orderId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shortId = orderId ? `${orderId.slice(0, 8)}...` : null

  return (
    <div className="min-h-screen bg-[#091540] text-[#FFF9F2] font-sans selection:bg-[#F2842F] selection:text-[#FFF9F2] flex flex-col justify-between relative overflow-hidden">
      {/* Background Ambient Mesh Glows */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#F2842F]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-10 right-10 w-96 h-96 bg-[#1e3073]/40 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Header */}
      <header className="bg-[#0f1d4f]/90 backdrop-blur-md border-b border-[#1e3073] py-4 px-6 relative z-10 shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/shop" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#F2842F] to-[#ff9e54] flex items-center justify-center font-bold text-lg text-[#FFF9F2] shadow-md shadow-[#F2842F]/20 group-hover:scale-105 transition-transform">
              S
            </div>
            <span className="text-xl font-extrabold tracking-tight text-[#FFF9F2]">
              Shop<span className="text-[#F2842F]">Front</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-full">
            <span>Verified Purchase</span>
          </div>
        </div>
      </header>

      {/* Main Card Section */}
      <main className="max-w-md w-full mx-auto px-4 py-12 relative z-10 my-auto">
        <div className="bg-[#0d1a45]/90 backdrop-blur-xl rounded-3xl border border-[#1e3073] p-8 shadow-2xl text-center relative overflow-hidden space-y-6">
          
          {/* Success Animated Badge */}
          <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
            <div className="absolute inset-0 bg-[#F2842F]/20 rounded-2xl blur-md animate-pulse" />
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#F2842F] to-[#d96f1d] border border-[#F2842F]/40 flex items-center justify-center text-[#FFF9F2] shadow-xl relative z-10">
              <FiCheckCircle size={42} />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#FFF9F2] tracking-tight">
              Order Confirmed!
            </h1>
            <p className="text-xs sm:text-sm text-[#FFF9F2]/70 leading-relaxed max-w-xs mx-auto">
              Thank you for your purchase. Your order has been placed and is currently being processed.
            </p>
          </div>

          {/* Reference Card */}
          {orderId && (
            <div className="bg-[#091540]/70 rounded-2xl border border-[#1e3073] p-4 text-left space-y-2">
              <div className="flex items-center justify-between text-xs text-[#FFF9F2]/50 font-bold uppercase tracking-wider">
                <span>Order Reference</span>
                <span className="text-emerald-400 flex items-center gap-1 font-semibold normal-case text-[11px]">
                  <FiPackage size={13} /> Processing
                </span>
              </div>
              
              <div className="flex items-center justify-between gap-2 bg-[#0d1a45] p-2.5 rounded-xl border border-[#1e3073]/80">
                <span className="font-mono text-xs text-[#FFF9F2] font-semibold truncate">
                  {orderId}
                </span>
                <button
                  onClick={handleCopyId}
                  className="p-2 bg-[#15255e] hover:bg-[#1e3073] text-[#F2842F] rounded-lg transition shrink-0 flex items-center gap-1 text-xs font-semibold"
                  title="Copy full reference ID"
                >
                  {copied ? <FiCheck size={14} className="text-emerald-400" /> : <FiCopy size={14} />}
                  <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Feature Micro-Badges */}
          <div className="pt-2 border-t border-[#1e3073]/60 grid grid-cols-2 gap-3 text-[11px] text-[#FFF9F2]/60">
            <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-[#091540]/40 border border-[#1e3073]/40">
              <FiMail className="text-[#F2842F]" size={14} />
              <span>Email Sent</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-[#091540]/40 border border-[#1e3073]/40">
              <FiShoppingBag className="text-emerald-400" size={14} />
              <span>Fast Shipping</span>
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div className="space-y-3 pt-2">
            <Link
              href="/shop"
              className="w-full py-3.5 px-6 bg-gradient-to-r from-[#F2842F] to-[#e06d19] hover:from-[#f49852] hover:to-[#F2842F] text-[#FFF9F2] font-semibold rounded-xl text-sm transition shadow-lg shadow-[#F2842F]/20 flex items-center justify-center gap-2 active:scale-98"
            >
              <span>Continue Shopping</span>
              <FiArrowRight size={18} />
            </Link>
          </div>

        </div>
      </main>

      {/* Footer Disclaimer */}
      <footer className="py-6 text-center text-xs text-[#FFF9F2]/40 relative z-10">
        Questions about your order? Contact store support anytime.
      </footer>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-[#091540] text-[#FFF9F2] flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-[#1e3073] border-t-[#F2842F] rounded-full animate-spin" />
          <p className="text-xs font-semibold text-[#FFF9F2]/60 animate-pulse">Confirming order details...</p>
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  )
}