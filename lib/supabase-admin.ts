import { createClient } from '@supabase/supabase-js'

// This file must only be imported by server code (route handlers).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  throw new Error('Missing Supabase admin environment variables')
}

export const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
})