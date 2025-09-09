import { createBrowserClient } from '@supabase/ssr'

// Create a mock client for when Supabase is unavailable
const createMockClient = () => {
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithOAuth: async () => ({ data: { url: null, provider: null }, error: { message: 'Supabase unavailable' } }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } }, error: null })
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: { message: 'Supabase unavailable' } }),
          maybeSingle: async () => ({ data: null, error: null })
        }),
        limit: () => ({ data: [], error: null }),
        order: () => ({ data: [], error: null })
      }),
      insert: () => ({
        select: () => ({
          single: async () => ({ data: null, error: { message: 'Supabase unavailable' } })
        })
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: async () => ({ data: null, error: { message: 'Supabase unavailable' } })
          })
        })
      })
    })
  } as any
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key || url.includes('your-project') || key.includes('your-anon-key')) {
    console.warn('Supabase credentials not configured properly. Running in offline mode.')
    return createMockClient()
  }
  
  try {
    // Test if URL exists before creating client
    const testUrl = new URL(url)
    if (testUrl.hostname.includes('your-project') || testUrl.hostname === 'localhost') {
      console.warn('Invalid Supabase URL detected. Running in offline mode.')
      return createMockClient()
    }
    
    return createBrowserClient(url, key, {
      auth: {
        persistSession: true, // Enable persistence to maintain sessions
        autoRefreshToken: true, // Enable auto-refresh for valid sessions
        detectSessionInUrl: true
      }
    })
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error)
    return createMockClient()
  }
}

export const supabase = createClient()