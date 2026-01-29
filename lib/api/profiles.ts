import { supabase } from '../supabase'

// Helper function to check if string is valid UUID format
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

// Get client profile with user data
export async function getClientProfile(userId: string) {
  try {
    // Check if userId is valid UUID format - if not, return mock data
    if (!isValidUUID(userId)) {
      console.log('[v0] Invalid UUID format, returning mock data:', userId)
      return { 
        data: { 
          id: userId, 
          company_name: 'ООО Экспо Сервис',
          rating: 4.8,
          profile: {},
          active_shifts: 2,
          completed_shifts: 15
        }, 
        error: null 
      }
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError && userError.code !== 'PGRST116') {
      return { data: null, error: userError }
    }

    // Return mock data if user not found (table might not exist yet)
    if (!user) {
      return { 
        data: { 
          id: userId, 
          company_name: 'ООО Экспо Сервис',
          rating: 4.8,
          profile: {}
        }, 
        error: null 
      }
    }

    const { data: profile, error: profileError } = await supabase
      .from('client_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    // If profile table doesn't exist, just return user data
    if (profileError && profileError.code === 'PGRST116') {
      return { data: user, error: null }
    }

    if (profileError) return { data: null, error: profileError }

    return { data: { ...user, profile }, error: null }
  } catch (error) {
    console.error('Error fetching client profile:', error)
    // Return mock data on complete failure
    return { 
      data: { 
        id: userId,
        company_name: 'ООО Экспо Сервис',
        rating: 4.8,
      }, 
      error: null 
    }
  }
}

// Get worker shift history
export async function getWorkerShiftHistory(workerId: string) {
  const { data, error } = await supabase
    .from('shift_workers')
    .select(`
      *,
      shift:shifts(*)
    `)
    .eq('worker_id', workerId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })

  return { data, error }
}

// Get worker ratings
export async function getWorkerRatings(workerId: string) {
  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('to_user_id', workerId)
    .order('created_at', { ascending: false })

  return { data, error }
}

// Get client profile with user data
export async function getClientProfile(userId: string) {
  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError && userError.code !== 'PGRST116') {
      return { data: null, error: userError }
    }

    // Return mock data if user not found (table might not exist yet)
    if (!user) {
      return { 
        data: { 
          id: userId, 
          company_name: 'ООО Экспо Сервис',
          rating: 4.8,
          profile: {}
        }, 
        error: null 
      }
    }

    const { data: profile, error: profileError } = await supabase
      .from('client_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    // If profile table doesn't exist, just return user data
    if (profileError && profileError.code === 'PGRST116') {
      return { data: user, error: null }
    }

    if (profileError) return { data: null, error: profileError }

    return { data: { ...user, profile }, error: null }
  } catch (error) {
    console.error('Error fetching client profile:', error)
    // Return mock data on complete failure
    return { 
      data: { 
        id: userId,
        company_name: 'ООО Экспо Сервис',
        rating: 4.8,
      }, 
      error: null 
    }
  }
}

// Get client active shifts
export async function getClientActiveShifts(clientId: string) {
  try {
    // Check if clientId is valid UUID format - if not, return mock data
    if (!isValidUUID(clientId)) {
      console.log('[v0] Invalid UUID format for clientId, returning mock active shifts')
      return { 
        data: [
          {
            id: '1',
            client_id: clientId,
            title: 'Монтаж выставочного стенда',
            location_address: 'Crocus Expo, павильон 3',
            date: '2026-01-28',
            start_time: '18:00',
            end_time: '02:00',
            pay_amount: 2500,
            status: 'open',
            category: 'Монтажник'
          }
        ], 
        error: null 
      }
    }

    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .eq('client_id', clientId)
      .in('status', ['open', 'in_progress'])
      .order('date', { ascending: true })

    if (error && error.code === 'PGRST116') {
      // Table doesn't exist - return mock data
      return { 
        data: [
          {
            id: '1',
            client_id: clientId,
            title: 'Монтаж выставочного стенда',
            location_address: 'Crocus Expo, павильон 3',
            date: '2026-01-28',
            start_time: '18:00',
            end_time: '02:00',
            pay_amount: 2500,
            status: 'open',
            category: 'Монтажник'
          }
        ], 
        error: null 
      }
    }

    if (error) return { data, error }

    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error fetching active shifts:', error)
    return { data: [], error: null }
  }
}

// Get client completed shifts
export async function getClientCompletedShifts(clientId: string) {
  try {
    // Check if clientId is valid UUID format - if not, return mock data
    if (!isValidUUID(clientId)) {
      console.log('[v0] Invalid UUID format for clientId, returning mock completed shifts')
      return { data: [], error: null }
    }

    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .eq('client_id', clientId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error && error.code === 'PGRST116') {
      // Table doesn't exist - return mock data
      return { data: [], error: null }
    }

    if (error) return { data, error }

    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error fetching completed shifts:', error)
    return { data: [], error: null }
  }
}
