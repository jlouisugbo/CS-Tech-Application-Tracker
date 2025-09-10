import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import type { Internship, User, SavedInternship, FilterState } from '../types'

// Hook for fetching internships with filters
export function useInternships(filters: FilterState) {
  const [internships, setInternships] = useState<Internship[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch from API endpoint (bypasses RLS issues with direct Supabase access)
        console.log('🔍 Fetching internships from API endpoint...')
        const response = await fetch('/api/internships')
        
        let filtered: any[] = []
        
        if (!response.ok) {
          console.error('❌ API request failed:', response.status, response.statusText)
          throw new Error(`Failed to fetch internships: ${response.status} ${response.statusText}`)
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
          filtered = filtered.filter(i => 
            i.locations.some((loc: string) => loc.toLowerCase().includes(filters.location.toLowerCase()))
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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch internships');
        setInternships([]);
      } finally {
        setLoading(false);
      }
    }

    // Simulate network delay
    setTimeout(fetchInternships, 300)
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

  return { internships, loading, error, refetch: () => {} }
}

// Hook for authentication
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    let isMounted = true

    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          if (isMounted) {
            setUser(null)
            setLoading(false)
            setInitializing(false)
          }
          return
        }

        if (session?.user && isMounted) {
          // Fetch or create user profile
          let { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          // If profile doesn't exist, create it
          if (profileError && profileError.code === 'PGRST116') {
            const { data: newProfile, error: createError } = await supabase
              .from('users')
              .insert({
                id: session.user.id,
                email: session.user.email,
                full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0]
              })
              .select()
              .single()

            if (!createError && newProfile) {
              profile = newProfile
            }
          }

          if (profile && isMounted) {
            setUser(profile)
          }
        } else if (isMounted) {
          setUser(null)
        }
      } catch (error) {
        console.error('Error in getSession:', error)
        if (isMounted) {
          setUser(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
          setInitializing(false)
        }
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email)
        
        if (!isMounted) return

        if (session?.user) {
          // Fetch or create user profile
          let { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          // If profile doesn't exist, create it
          if (profileError && profileError.code === 'PGRST116') {
            const { data: newProfile, error: createError } = await supabase
              .from('users')
              .insert({
                id: session.user.id,
                email: session.user.email,
                full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0]
              })
              .select()
              .single()

            if (!createError && newProfile) {
              profile = newProfile
            }
          }

          if (profile) {
            setUser(profile)
          }
        } else {
          setUser(null)
        }
        
        setLoading(false)
        setInitializing(false)
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
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
        }
        return { error }
      }
      
      return { data, error: null }
    } catch (err) {
      return { error: { message: 'An unexpected error occurred during sign in.' } }
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
        }
        return { error }
      }
      
      return { data, error: null }
    } catch (err) {
      return { error: { message: 'An unexpected error occurred during sign up.' } }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (!error) {
        // Clear user state immediately for better UX
        setUser(null)
      }
      
      return { error }
    } catch (err) {
      return { error: { message: 'An error occurred during sign out.' } }
    }
  }

  return { 
    user, 
    loading, 
    initializing,
    signIn, 
    signUp, 
    signOut 
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

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // Fetch from Supabase database
        const { data, error } = await supabase
          .from('internships')
          .select('company, locations, date_posted')
          .eq('is_active', true)

        if (error || !data) {
          console.error('Error fetching filter options:', error)
          // Keep default values
          return
        }

        // Extract unique values from database
        const uniqueCompanies = new Set<string>()
        const uniqueLocations = new Set<string>()
        const uniqueDates = new Set<string>()

        data.forEach((internship) => {
          uniqueCompanies.add(internship.company)
          
          // Add each location
          internship.locations?.forEach((location: string) => {
            if (location.trim() && !location.includes('locations')) { // Filter out "X locations" entries
              uniqueLocations.add(location.trim())
            }
          })
          
          uniqueDates.add(internship.date_posted)
        })

        // Sort and set options
        setCompanies(['All', ...Array.from(uniqueCompanies).sort()])
        setLocations(['All', ...Array.from(uniqueLocations).sort()])
        setDatePosted(['All', ...Array.from(uniqueDates).sort()])
      } catch (error) {
        console.error('Error fetching filter options:', error)
      }
    }

    fetchOptions()
  }, [])

  return { companies, locations, datePosted }
}