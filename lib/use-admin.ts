'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// Returns { loading, isAdmin }. Redirects to /login if not signed in,
// and to /shop if signed in but not an admin.
export function useAdminGuard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const check = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user

      if (!user) {
        router.replace('/login')
        return
      }

      const { data: adminRow, error } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error || !adminRow) {
        router.replace('/shop')
        return
      }

      setIsAdmin(true)
      setLoading(false)
    }

    check()
  }, [router])

  return { loading, isAdmin }
}