'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react'

// Brand Palette Theme Constants
const theme = {
  Orange: "#F2842F",
  White: "#FFF9F2",
  Darkblue: "#091540",
} as const;

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    
    <div className="relative min-h-screen bg-[#091540] text-[#FFF9F2] flex items-center justify-center p-4 overflow-hidden selection:bg-[#F2842F] selection:text-[#FFF9F2]">
      
      {/* Ambient Gradient Mesh Background Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#F2842F]/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#1e3073]/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0d1a45]/60 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glassmorphic Card */}
      <div className="relative w-full max-w-md bg-[#0d1a45]/85 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-[#1e3073] transition-all duration-300">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#F2842F]/10 border border-[#F2842F]/30 text-[#F2842F] mb-4 shadow-lg shadow-[#F2842F]/5">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#FFF9F2] tracking-tight">ShopAdmin</h1>
          <p className="text-xs md:text-sm text-[#FFF9F2]/60 mt-1.5">Sign in to access your store workspace</p>
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div className="mb-6 p-4 bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs md:text-sm rounded-2xl flex items-start gap-3 shadow-md animate-in fade-in slide-in-from-top-2 duration-200">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-rose-300">Authentication Failed</p>
              <p className="text-rose-200/80 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input Field */}
          <div>
            <label className="block text-xs font-bold text-[#FFF9F2]/80 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#FFF9F2]/40 group-focus-within:text-[#F2842F] transition-colors">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                autoComplete="email"
                required
                className="w-full pl-10 pr-4 py-3 bg-[#091540]/60 border border-[#1e3073] rounded-xl text-[#FFF9F2] placeholder-[#FFF9F2]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#F2842F]/40 focus:border-[#F2842F] transition-all duration-200"
              />
            </div>
          </div>

          {/* Password Input Field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-[#FFF9F2]/80 uppercase tracking-wider">
                Password
              </label>
              <Link 
                href="/forgot-password" 
                className="text-xs text-[#F2842F] hover:text-[#f49852] font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#FFF9F2]/40 group-focus-within:text-[#F2842F] transition-colors">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full pl-10 pr-11 py-3 bg-[#091540]/60 border border-[#1e3073] rounded-xl text-[#FFF9F2] placeholder-[#FFF9F2]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#F2842F]/40 focus:border-[#F2842F] transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#FFF9F2]/40 hover:text-[#FFF9F2] transition-colors focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me Toggle */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-[#FFF9F2]/70 hover:text-[#FFF9F2] transition-colors">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#1e3073] bg-[#091540] text-[#F2842F] focus:ring-[#F2842F]/30 focus:ring-offset-0 cursor-pointer accent-[#F2842F]"
              />
              <span>Remember this device for 30 days</span>
            </label>
          </div>

          {/* Submit CTA Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-[#F2842F] to-[#e06d19] hover:from-[#f49852] hover:to-[#F2842F] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none text-[#FFF9F2] text-sm font-semibold rounded-xl shadow-lg shadow-[#F2842F]/20 transition-all duration-200 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-[#FFF9F2]/60 text-xs md:text-sm text-center mt-8 pt-6 border-t border-[#1e3073]/60">
          Don't have an admin account?{' '}
          <Link href="/register" className="text-[#F2842F] hover:text-[#f49852] font-bold transition-colors">
            Request access
          </Link>
        </p>

        {/* Security Trust Badge */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-[#FFF9F2]/40 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>256-bit SSL Encrypted Administrative Session</span>
        </div>
      </div>
    </div>
  )
}