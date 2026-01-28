import { supabase } from '../supabase'

// Get worker profile with user data
export async function getWorkerProfile(userId: string) {
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (userError) return { data: null, error: userError }

  const { data: profile, error: profileError } = await supabase
    .from('worker_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (profileError) return { data: null, error: profileError }

  return { data: { ...user, profile }, error: null }
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
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (userError) return { data: null, error: userError }

  const { data: profile, error: profileError } = await supabase
    .from('client_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (profileError) return { data: null, error: profileError }

  return { data: { ...user, profile }, error: null }
}

// Get client active shifts
export async function getClientActiveShifts(clientId: string) {
  const { data, error } = await supabase
    .from('shifts')
    .select('*')
    .eq('client_id', clientId)
    .in('status', ['open', 'in_progress'])
    .order('date', { ascending: true })

  return { data, error }
}

// Get client completed shifts
export async function getClientCompletedShifts(clientId: string) {
  const { data, error } = await supabase
    .from('shifts')
    .select('*')
    .eq('client_id', clientId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(10)

  return { data, error }
}
