import { createClient } from '@/lib/supabase-client'

export const getUserRole = async (): Promise<'worker' | 'client' | 'shef'> => {
  if (typeof window === 'undefined') return 'worker';

  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      // No user logged in, check localStorage as fallback
      return (localStorage.getItem('userRole') as 'worker' | 'client' | 'shef') || 'worker'
    }

    // Fetch role from database
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role) {
      // Update localStorage with correct role
      localStorage.setItem('userRole', userData.role)
      return userData.role as 'worker' | 'client' | 'shef'
    }

    // Fallback to localStorage
    return (localStorage.getItem('userRole') as 'worker' | 'client' | 'shef') || 'worker'
  } catch (error) {
    console.error('Error getting user role:', error)
    return (localStorage.getItem('userRole') as 'worker' | 'client' | 'shef') || 'worker'
  }
};
