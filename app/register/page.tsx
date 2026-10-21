'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  FiArrowLeft, 
  FiUser, 
  FiMail, 
  FiLock, 
  FiAlertCircle, 
  FiLoader, 
  FiCheckCircle, 
  FiEye, 
  FiEyeOff, 
  FiUserPlus 
} from 'react-icons/fi'

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTarget = searchParams.get('redirect') || '/shop'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: name.trim() },
      },
    })

    setLoading(false)

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    router.push(redirectTarget)
  }

  return (
    <div className="min-h-screen bg-[#091540] text-[#FFF9F2] font-sans selection:bg-[#F2842F] selection:text-[#FFF9F2] flex flex-col justify-between relative overflow-x-hidden">
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#F2842F]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-[#1e3073]/30 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="bg-[#0f1d4f]/90 backdrop-blur-md border-b border-[#1e3073] py-4 px-4 sm:px-8 relative z-10 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#F2842F] to-[#ff9e54] flex items-center justify-center font-bold text-lg text-[#FFF9F2] shadow-md shadow-[#F2842F]/20 group-hover:scale-105 transition-transform">
              S
            </div>
            <span className="text-xl font-extrabold tracking-tight text-[#FFF9F2]">
              Shop<span className="text-[#F2842F]">Front</span>
            </span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[#FFF9F2]/70 hover:text-[#FFF9F2] bg-[#0d1a45] hover:bg-[#15255e] border border-[#1e3073] hover:border-[#F2842F]/40 rounded-xl transition"
          >
            <FiArrowLeft size={14} />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto relative z-10">
        <div className="w-full max-w-md bg-[#0d1a45]/90 backdrop-blur-xl rounded-3xl border border-[#1e3073] p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* Card Title */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#15255e] text-[#F2842F] border border-[#1e3073] flex items-center justify-center mx-auto shadow-md">
              <FiUserPlus size={22} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#FFF9F2] tracking-tight">
              Create an account
            </h1>
            <p className="text-xs sm:text-sm text-[#FFF9F2]/60">
              Sign up now to start shopping and tracking orders
            </p>
          </div>

          {/* Error Message Alert */}
          {error && (
            <div className="p-4 bg-rose-950/80 border border-rose-500/50 rounded-2xl text-rose-200 text-xs sm:text-sm flex items-start gap-3 shadow-lg">
              <FiAlertCircle size={18} className="text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#FFF9F2]/80 uppercase tracking-wider">
                Full name
              </label>
              <div className="relative group">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FFF9F2]/40 group-focus-within:text-[#F2842F] transition-colors" size={18} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#091540]/70 border border-[#1e3073] rounded-xl text-[#FFF9F2] placeholder-[#FFF9F2]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#F2842F]/40 focus:border-[#F2842F] transition shadow-inner"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#FFF9F2]/80 uppercase tracking-wider">
                Email address
              </label>
              <div className="relative group">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FFF9F2]/40 group-focus-within:text-[#F2842F] transition-colors" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#091540]/70 border border-[#1e3073] rounded-xl text-[#FFF9F2] placeholder-[#FFF9F2]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#F2842F]/40 focus:border-[#F2842F] transition shadow-inner"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#FFF9F2]/80 uppercase tracking-wider">
                Password
              </label>
              <div className="relative group">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FFF9F2]/40 group-focus-within:text-[#F2842F] transition-colors" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full pl-10 pr-10 py-3 bg-[#091540]/70 border border-[#1e3073] rounded-xl text-[#FFF9F2] placeholder-[#FFF9F2]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#F2842F]/40 focus:border-[#F2842F] transition shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#FFF9F2]/40 hover:text-[#FFF9F2] transition"
                  tabIndex={-1}
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#FFF9F2]/80 uppercase tracking-wider">
                Confirm password
              </label>
              <div className="relative group">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FFF9F2]/40 group-focus-within:text-[#F2842F] transition-colors" size={18} />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                  className="w-full pl-10 pr-10 py-3 bg-[#091540]/70 border border-[#1e3073] rounded-xl text-[#FFF9F2] placeholder-[#FFF9F2]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#F2842F]/40 focus:border-[#F2842F] transition shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#FFF9F2]/40 hover:text-[#FFF9F2] transition"
                  tabIndex={-1}
                >
                  {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-[#F2842F] to-[#e06d19] hover:from-[#f49852] hover:to-[#F2842F] disabled:opacity-50 disabled:pointer-events-none text-[#FFF9F2] text-sm font-bold rounded-xl shadow-lg shadow-[#F2842F]/20 transition flex items-center justify-center gap-2 active:scale-98 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin" size={18} />
                  <span>Creating account...</span>
                </>
              ) : (
                <span>Create account</span>
              )}
            </button>
          </form>

          {/* Security Guarantee Banner */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#FFF9F2]/50 pt-2 border-t border-[#1e3073]/60">
            <FiCheckCircle className="text-emerald-400" size={14} />
            <span>Instant activation with zero spam emails guaranteed</span>
          </div>

          {/* Footer Link to Login */}
          <p className="text-center text-xs sm:text-sm text-[#FFF9F2]/60 pt-2">
            Already have an account?{' '}
            <Link 
              href={`/login${redirectTarget !== '/shop' ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`} 
              className="text-[#F2842F] hover:text-[#ff9e54] font-semibold transition"
            >
              Sign in
            </Link>
          </p>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0f1d4f]/80 border-t border-[#1e3073] py-4 text-center text-xs text-[#FFF9F2]/40 relative z-10">
        &copy; {new Date().getFullYear()} Our Store. All rights reserved.
      </footer>
    </div>
  )
}