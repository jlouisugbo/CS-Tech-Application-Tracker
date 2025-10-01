import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Use localStorage for better persistence (default, but explicit)
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    debug: false
  },
  // Add retry configuration for better reliability
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

export default supabase