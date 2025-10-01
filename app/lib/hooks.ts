"use client"

import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { refreshSessionIfNeeded, enableAuthDebugging } from './auth-utils'
import type { Internship, User, SavedInternship, FilterState } from '../types'

// Location alias map for smart filtering (matches backend normalization)
const LOCATION_ALIASES: Record<string, string> = {
  'nyc': 'New York, NY',
  'new york': 'New York, NY',
  'new york city': 'New York, NY',
  'manhattan': 'New York, NY',
  'brooklyn': 'New York, NY',
  'sf': 'San Francisco, CA',
  'san francisco': 'San Francisco, CA',
  'san fran': 'San Francisco, CA',
  'bay area': 'San Francisco Bay Area, CA',
  'silicon valley': 'San Francisco Bay Area, CA',
  'la': 'Los Angeles, CA',
  'los angeles': 'Los Angeles, CA',
  'dc': 'Washington, DC',
  'washington dc': 'Washington, DC',
  'remote': 'Remote',
  'remote in usa': 'Remote',
  'remote us': 'Remote',
  'wfh': 'Remote',
};

function normalizeLocation(location: string): string {
  if (!location) return 'Remote';
  const normalized = location.toLowerCase().trim();
  return LOCATION_ALIASES[normalized] || location.trim();
}

// Hook for fetching internships with filters
export function useInternships(filters: FilterState) {
  const [internships, setInternships] = useState<Internship[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const fetchInternships = async (isRetry = false) => {
    try {
      setLoading(true)
      if (!isRetry) {
        setError(null)
        setRetryCount(0)
      }

      // Fetch from API endpoint (bypasses RLS issues with direct Supabase access)
      console.log('🔍 Fetching internships from API endpoint...')
      const response = await fetch('/api/internships', {
        cache: 'no-store', // Ensure fresh data on retry
      })

      let filtered: any[] = []

      if (!response.ok) {
        console.error('❌ API request failed:', response.status, response.statusText)

        // Provide more specific error messages based on status codes
        if (response.status === 503 || response.status === 502) {
          throw new Error('Server is temporarily unavailable. Please try again in a moment.')
        } else if (response.status === 404) {
          throw new Error('Internships service not found. Please contact support.')
        } else if (response.status >= 500) {
          throw new Error('Server error occurred. Please try again or contact support if the problem persists.')
        } else if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment before trying again.')
        } else {
          throw new Error(`Unable to load internships (Error ${response.status}). Please try again.`)
        }
      } else {
        const result = await response.json()
        if (result.internships) {
          console.log(`✅ Successfully loaded ${result.internships.length} internships from API`)
          filtered = result.internships
        } else {
          console.error('❌ No internships found in API response')
          filtered = []
        }
      }

        // Apply client-side filters
        if (filters.category && filters.category !== 'All') {
          filtered = filtered.filter(i => i.category === filters.category)
        }

        if (filters.citizenship && filters.citizenship === 'no_citizenship') {
          filtered = filtered.filter(i => !i.requires_citizenship)
        }

        if (filters.sponsorship && filters.sponsorship === 'sponsorship_ok') {
          filtered = filtered.filter(i => !i.no_sponsorship)
        }

        if (filters.freshman_friendly) {
          filtered = filtered.filter(i => i.is_freshman_friendly)
        }

        if (filters.location && filters.location !== 'All') {
          const searchTerm = normalizeLocation(filters.location);

          filtered = filtered.filter(i =>
            i.locations.some((loc: string) => {
              const normalizedLocation = normalizeLocation(loc);

              // Exact match (preferred)
              if (normalizedLocation === searchTerm) {
                return true;
              }

              // Partial match for flexibility
              return normalizedLocation.toLowerCase().includes(searchTerm.toLowerCase());
            })
          )
        }

        if (filters.company && filters.company !== 'All') {
          filtered = filtered.filter(i => 
            i.company.toLowerCase().includes(filters.company.toLowerCase())
          )
        }

        if (filters.date_posted && filters.date_posted !== 'All') {
          filtered = filtered.filter(i => i.date_posted === filters.date_posted)
        }

        // Apply sorting with priority for open internships
        filtered.sort((a, b) => {
          // First priority: Open internships come before closed ones
          if (a.is_closed !== b.is_closed) {
            return a.is_closed ? 1 : -1; // Open (false) comes first
          }
          
          // Second priority: Apply user-selected sorting
          switch (filters.sort_by) {
            case 'date_newest':
              // Sort by date posted (newest first) - parse "Sep 02" format
              const dateA = new Date(`${a.date_posted} 2025`).getTime();
              const dateB = new Date(`${b.date_posted} 2025`).getTime();
              return dateB - dateA;
            case 'date_oldest':
              const dateA2 = new Date(`${a.date_posted} 2025`).getTime();
              const dateB2 = new Date(`${b.date_posted} 2025`).getTime();
              return dateA2 - dateB2;
            case 'company_az':
              return a.company.localeCompare(b.company);
            case 'company_za':
              return b.company.localeCompare(a.company);
            default:
              return 0;
          }
        });

        setInternships(filtered);
        setError(null); // Clear any previous errors on success
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch internships'
        console.error('Error in fetchInternships:', errorMessage)
        setError(errorMessage);
        setInternships([]);

        // Increment retry count for potential retry functionality
        if (isRetry) {
          setRetryCount(prev => prev + 1)
        }
      } finally {
        setLoading(false);
      }
    }

    useEffect(() => {
      // Add slight delay to prevent excessive API calls during rapid filter changes
      const timeoutId = setTimeout(() => {
        fetchInternships()
      }, 300)

      return () => clearTimeout(timeoutId)
    }, [
      filters.category,
      filters.location,
      filters.citizenship,
      filters.sponsorship,
      filters.freshman_friendly,
      filters.company,
      filters.date_posted,
      filters.sort_by,
      filters.view_mode
      // Note: company_sort_by is only used in CompanyGroupView, not here
    ])

  const retry = () => {
    fetchInternships(true)
  }

  return { internships, loading, error, retry, retryCount }
}

// Hook for authentication
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [initializing, setInitializing] = useState(true)
  const [sessionError, setSessionError] = useState<string | null>(null)

  // Helper function to handle user profile creation/retrieval
  const handleUserProfile = async (sessionUser: any): Promise<User | null> => {
    try {
      // First try to fetch existing profile
      let { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', sessionUser.id)
        .single()

      // If profile doesn't exist, create it
      if (profileError && profileError.code === 'PGRST116') {
        console.log('Creating new user profile for:', sessionUser.email)
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert({
            id: sessionUser.id,
            email: sessionUser.email,
            full_name: sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0]
          })
          .select()
          .single()

        if (!createError && newProfile) {
          profile = newProfile
        } else {
          console.error('Error creating user profile:', createError)
          // Fall back to basic user object if profile creation fails
          return {
            id: sessionUser.id,
            email: sessionUser.email,
            full_name: sessionUser.email?.split('@')[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            needs_sponsorship: false,
            is_us_citizen: true
          } as User
        }
      } else if (profileError) {
        console.error('Error fetching user profile:', profileError)
        // Fall back to basic user object if profile fetch fails
        return {
          id: sessionUser.id,
          email: sessionUser.email,
          full_name: sessionUser.email?.split('@')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          needs_sponsorship: false,
          is_us_citizen: true
        } as User
      }

      return profile
    } catch (error) {
      console.error('Error handling user profile:', error)
      // Return basic user object as fallback
      return {
        id: sessionUser.id,
        email: sessionUser.email,
        full_name: sessionUser.email?.split('@')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        needs_sponsorship: false,
        is_us_citizen: true
      } as User
    }
  }

  useEffect(() => {
    let isMounted = true

    // Get initial session with timeout to prevent infinite loading
    const initializeAuth = async () => {
      try {
        console.log('🔐 Initializing authentication...')

        // Set a timeout to ensure loading state clears
        const timeoutId = setTimeout(() => {
          if (isMounted) {
            console.warn('⚠️ Auth initialization timeout - clearing loading state')
            setLoading(false)
            setInitializing(false)
          }
        }, 5000) // 5 second timeout

        const { data: { session }, error } = await supabase.auth.getSession()

        clearTimeout(timeoutId) // Clear timeout if we get a response

        if (error) {
          console.error('❌ Error getting session:', error)
          if (isMounted) {
            setUser(null)
            setLoading(false)
            setInitializing(false)
          }
          return
        }

        if (session?.user && isMounted) {
          console.log('✅ Found existing session for:', session.user.email)
          const userProfile = await handleUserProfile(session.user)
          if (isMounted && userProfile) {
            setUser(userProfile)
          }
        } else {
          console.log('ℹ️ No existing session found')
          if (isMounted) {
            setUser(null)
          }
        }
      } catch (error) {
        console.error('💥 Error initializing auth:', error)
        if (isMounted) {
          setUser(null)
          setSessionError('Failed to initialize authentication. Please try refreshing the page.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
          setInitializing(false)
        }
      }
    }

    initializeAuth()

    // Enable auth debugging in development
    if (process.env.NODE_ENV === 'development') {
      enableAuthDebugging(true)
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event, session?.user?.email)

        if (!isMounted) return

        // Don't process initial session event since we handle that above
        if (event === 'INITIAL_SESSION') return

        setLoading(true)
        setSessionError(null) // Clear previous errors

        try {
          if (session?.user) {
            const userProfile = await handleUserProfile(session.user)
            if (isMounted && userProfile) {
              setUser(userProfile)
              console.log('✅ User authenticated:', userProfile.email)
            }
          } else {
            if (isMounted) {
              setUser(null)
              // Handle different sign-out events
              if (event === 'SIGNED_OUT') {
                console.log('👋 User signed out')
              } else if (event === 'TOKEN_REFRESHED') {
                console.log('🔄 Token refreshed but session lost')
                setSessionError('Your session has expired. Please sign in again.')
              }
            }
          }
        } catch (error) {
          console.error('Error in auth state change:', error)
          if (isMounted) {
            setUser(null)
            setSessionError('Authentication error occurred. Please try signing in again.')
          }
        } finally {
          if (isMounted) {
            setLoading(false)
          }
        }
      }
    )

    // Handle tab visibility changes to refresh session
    const handleVisibilityChange = async () => {
      if (!document.hidden && user && isMounted) {
        // Check if session is still valid when user returns to tab
        try {
          const { data: { session }, error } = await supabase.auth.getSession()
          if (error || !session?.user) {
            console.log('🔄 Session lost, signing out user')
            setUser(null)
            setSessionError('Your session has expired. Please sign in again.')
          }
        } catch (err) {
          console.error('Session check error:', err)
        }
      }
    }

    // Add visibility change listener for better session management
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange)
    }

    // Set up periodic session health checks
    let sessionCheckInterval: NodeJS.Timeout
    if (user && typeof window !== 'undefined') {
      sessionCheckInterval = setInterval(async () => {
        if (isMounted && user) {
          const result = await refreshSessionIfNeeded()
          if (!result.success) {
            console.log('🔄 Periodic session check failed:', result.error)
            // Don't automatically sign out on periodic checks to avoid disrupting user
            // Only sign out if the session is completely invalid
          }
        }
      }, 10 * 60 * 1000) // Check every 10 minutes
    }

    return () => {
      isMounted = false
      subscription.unsubscribe()
      if (typeof window !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
      if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval)
      }
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        // Provide more user-friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          return { error: { message: 'Invalid email or password. Please check your credentials and try again.' } }
        } else if (error.message.includes('Email not confirmed')) {
          return { error: { message: 'Please check your email and verify your account before signing in.' } }
        } else if (error.message.includes('Too many requests')) {
          return { error: { message: 'Too many sign-in attempts. Please wait a moment before trying again.' } }
        } else if (error.message.includes('Network error')) {
          return { error: { message: 'Network error. Please check your internet connection and try again.' } }
        }
        return { error }
      }

      return { data, error: null }
    } catch (err) {
      console.error('Sign in error:', err)
      return { error: { message: 'An unexpected error occurred during sign in. Please try again.' } }
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: email.split('@')[0]
          }
        }
      })

      if (error) {
        // Provide more user-friendly error messages
        if (error.message.includes('already registered')) {
          return { error: { message: 'An account with this email already exists. Please sign in instead.' } }
        } else if (error.message.includes('Password should be at least')) {
          return { error: { message: 'Password must be at least 6 characters long.' } }
        } else if (error.message.includes('Invalid email')) {
          return { error: { message: 'Please enter a valid email address.' } }
        } else if (error.message.includes('Network error')) {
          return { error: { message: 'Network error. Please check your internet connection and try again.' } }
        }
        return { error }
      }

      return { data, error: null }
    } catch (err) {
      console.error('Sign up error:', err)
      return { error: { message: 'An unexpected error occurred during sign up. Please try again.' } }
    }
  }

  const signOut = async () => {
    try {
      // Clear user state immediately for better UX
      setUser(null)

      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('Sign out error:', error)
        return { error: { message: 'An error occurred during sign out. You may need to clear your browser cookies.' } }
      }

      // Force clear any remaining session data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token')
        sessionStorage.clear()
      }

      return { error: null }
    } catch (err) {
      console.error('Sign out error:', err)
      return { error: { message: 'An error occurred during sign out. You may need to clear your browser cookies.' } }
    }
  }

  const clearSessionError = () => {
    setSessionError(null)
  }

  // Helper function to check if session is valid
  const isSessionValid = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      return !error && !!session?.user
    } catch {
      return false
    }
  }

  // Helper function to refresh session
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) {
        console.error('Session refresh failed:', error)
        return { error }
      }
      return { data, error: null }
    } catch (err) {
      console.error('Session refresh error:', err)
      return { error: { message: 'Failed to refresh session' } }
    }
  }

  return {
    user,
    loading,
    initializing,
    sessionError,
    signIn,
    signUp,
    signOut,
    clearSessionError,
    isSessionValid,
    refreshSession
  }
}

// Hook for saved internships
export function useSavedInternships() {
  const [savedInternships, setSavedInternships] = useState<SavedInternship[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSavedInternships = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from('user_saved_internships')
          .select(`
            *,
            internships (
              company,
              role,
              category,
              locations,
              application_link,
              date_posted
            )
          `)
          .order('saved_at', { ascending: false })

        if (error) throw error
        setSavedInternships(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch saved internships')
        setSavedInternships([])
      } finally {
        setLoading(false)
      }
    }

    fetchSavedInternships()
  }, [])

  const saveInternship = async (internshipId: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('user_saved_internships')
        .insert({
          internship_id: internshipId,
          notes,
          application_status: 'saved'
        })

      if (error) throw error
      
      // Refresh saved internships
      const { data } = await supabase
        .from('user_saved_internships')
        .select(`
          *,
          internships (
            company,
            role,
            category,
            locations,
            application_link,
            date_posted
          )
        `)
        .order('saved_at', { ascending: false })
      
      setSavedInternships(data || [])
      return { success: true }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to save internship' }
    }
  }

  const unsaveInternship = async (internshipId: string) => {
    try {
      const { error } = await supabase
        .from('user_saved_internships')
        .delete()
        .eq('internship_id', internshipId)

      if (error) throw error
      
      setSavedInternships(prev => 
        prev.filter(saved => saved.internship_id !== internshipId)
      )
      return { success: true }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to unsave internship' }
    }
  }

  const updateApplicationStatus = async (
    internshipId: string, 
    status: SavedInternship['application_status']
  ) => {
    try {
      const updateData: any = { application_status: status }
      
      // Add timestamp for applied status
      if (status === 'applied') {
        updateData.applied_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('user_saved_internships')
        .update(updateData)
        .eq('internship_id', internshipId)

      if (error) throw error
      
      setSavedInternships(prev => 
        prev.map(saved => 
          saved.internship_id === internshipId 
            ? { ...saved, ...updateData }
            : saved
        )
      )
      return { success: true }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to update status' }
    }
  }

  const addNote = async (internshipId: string, note: string) => {
    try {
      const { error } = await supabase
        .from('user_saved_internships')
        .update({ notes: note })
        .eq('internship_id', internshipId)

      if (error) throw error
      
      setSavedInternships(prev => 
        prev.map(saved => 
          saved.internship_id === internshipId 
            ? { ...saved, notes: note }
            : saved
        )
      )
      return { success: true }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to add note' }
    }
  }

  const markLinkClicked = async (savedInternshipId: string) => {
    try {
      const { error } = await supabase
        .from('user_saved_internships')
        .update({ 
          application_link_clicked_at: new Date().toISOString(),
          link_verified: true
        })
        .eq('id', savedInternshipId)

      if (error) throw error
      
      setSavedInternships(prev => 
        prev.map(saved => 
          saved.id === savedInternshipId 
            ? { 
                ...saved, 
                application_link_clicked_at: new Date().toISOString(),
                link_verified: true 
              }
            : saved
        )
      )
      return { success: true }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to mark link clicked' }
    }
  }

  return { 
    savedInternships, 
    loading, 
    error, 
    saveInternship, 
    unsaveInternship,
    updateApplicationStatus,
    addNote,
    markLinkClicked
  }
}

// Hook for getting internship stats
export function useInternshipStats() {
  const [stats, setStats] = useState<{
    total_active: number
    freshman_friendly_count: number
    categories: Array<{ category: string; count: number }>
    last_updated: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)

        // Get total count
        const { count: totalCount } = await supabase
          .from('internships')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)

        // Get freshman-friendly count
        const { count: freshmanCount } = await supabase
          .from('internships')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)
          .eq('is_freshman_friendly', true)

        // Get category breakdown
        const { data: categories } = await supabase
          .rpc('get_category_counts')

        setStats({
          total_active: totalCount || 0,
          freshman_friendly_count: freshmanCount || 0,
          categories: categories || [],
          last_updated: new Date().toISOString()
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading }
}

// Hook to check if internship is saved by current user
export function useIsSaved(internshipId: string) {
  const [isSaved, setIsSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkIfSaved = async () => {
      try {
        // Remove .single() to avoid 406 errors - just check if any data exists
        const { data, error } = await supabase
          .from('user_saved_internships')
          .select('id')
          .eq('internship_id', internshipId)
          .limit(1)

        // Only consider it an error if it's not a "no rows" error
        if (error && error.code !== 'PGRST116') {
          console.error('Error checking saved status:', error)
        }

        setIsSaved(Boolean(data && data.length > 0))
      } catch (error) {
        // Silently handle errors - assume not saved
        setIsSaved(false)
      } finally {
        setLoading(false)
      }
    }

    if (internshipId && internshipId !== 'sample_') {
      checkIfSaved()
    } else {
      // Don't query for invalid IDs
      setIsSaved(false)
      setLoading(false)
    }
  }, [internshipId])

  return { isSaved, loading }
}

// Hook to extract dynamic filter options from data
export function useFilterOptions() {
  const [companies, setCompanies] = useState<string[]>(['All'])
  const [locations, setLocations] = useState<string[]>(['All'])
  const [datePosted, setDatePosted] = useState<string[]>(['All'])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/internships', {
          cache: 'no-store',
        })

        if (!response.ok) {
          console.warn('Failed to fetch filter options, using defaults')
          return
        }

        const result = await response.json()
        const data = result.internships || []

        const uniqueCompanies = new Set<string>()
        const uniqueLocations = new Set<string>()
        const uniqueDates = new Set<string>()

        data.forEach((internship: any) => {
          if (internship.company) {
            uniqueCompanies.add(internship.company)
          }

          internship.locations?.forEach((location: string) => {
            if (location?.trim() && !location.toLowerCase().includes('locations')) {
              uniqueLocations.add(location.trim())
            }
          })

          if (internship.date_posted) {
            uniqueDates.add(internship.date_posted)
          }
        })

        setCompanies(['All', ...Array.from(uniqueCompanies).sort()])
        setLocations(['All', ...Array.from(uniqueLocations).sort()])
        setDatePosted(['All', ...Array.from(uniqueDates).sort()])
      } catch (error) {
        console.error('Error fetching filter options:', error)
        setError('Failed to load filter options')
        // Keep default values on error
      } finally {
        setLoading(false)
      }
    }

    // Add slight delay to prevent excessive API calls
    const timeoutId = setTimeout(fetchOptions, 100)
    return () => clearTimeout(timeoutId)
  }, [])

  return { companies, locations, datePosted, loading, error }
}

// Hook to detect network connectivity
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    // Initial status
    setIsOnline(navigator.onLine)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}