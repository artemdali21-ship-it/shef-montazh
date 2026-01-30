import { supabase } from '../supabase'

export interface Shift {
  id: string
  client_id: string
  title: string
  description?: string
  category: string
  location_address: string
  location_lat?: number
  location_lng?: number
  date: string
  start_time: string
  end_time: string
  pay_amount: number
  required_workers: number
  required_rating: number
  tools_required?: string[]
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

// Get all shifts (any status)
export async function getAllShifts() {
  const { data, error } = await supabase
    .from('shifts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching shifts:', error)
    throw error
  }

  return data || []
}

// Get all open shifts
export async function getOpenShifts(filters?: {
  category?: string
  minPay?: number
  maxPay?: number
  date?: string
}) {
  let query = supabase
    .from('shifts')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }

  if (filters?.minPay) {
    query = query.gte('pay_amount', filters.minPay)
  }

  if (filters?.maxPay) {
    query = query.lte('pay_amount', filters.maxPay)
  }

  if (filters?.date) {
    query = query.eq('date', filters.date)
  }

  const { data, error } = await query

  return { data, error }
}

// Get shift by ID
export async function getShiftById(shiftId: string) {
  const { data, error } = await supabase
    .from('shifts')
    .select('*')
    .eq('id', shiftId)
    .single()

  return { data, error }
}

// Get shifts created by client (with optional status filter)
export async function getClientShifts(clientId: string, status?: string) {
  let query = supabase
    .from('shifts')
    .select('*')
    .eq('client_id', clientId)

  if (status) {
    query = query.eq('status', status)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query

  return { data, error }
}

// Get client statistics
export async function getClientStats(clientId: string) {
  try {
    // Get all client shifts
    const { data: shifts, error: shiftsError } = await getClientShifts(clientId)
    if (shiftsError) throw shiftsError

    const allShifts = shifts || []
    const activeShifts = allShifts.filter(
      (s: Shift) => s.status === 'open' || s.status === 'in_progress'
    )
    const totalPublished = allShifts.length
    const totalSpent = allShifts
      .filter((s: Shift) => s.status === 'completed')
      .reduce((sum: number, s: Shift) => sum + s.pay_amount, 0)

    // Get ratings from completed shifts
    const completedShiftIds = allShifts
      .filter((s: Shift) => s.status === 'completed')
      .map((s: Shift) => s.id)

    let averageRating = 0
    if (completedShiftIds.length > 0) {
      const { data: ratings } = await supabase
        .from('ratings')
        .select('rating')
        .eq('to_user_id', clientId)
        .in('shift_id', completedShiftIds)

      if (ratings && ratings.length > 0) {
        const sum = ratings.reduce((acc: number, r: any) => acc + (r.rating || 0), 0)
        averageRating = sum / ratings.length
      }
    }

    return {
      data: {
        activeShifts: activeShifts.length,
        totalPublished,
        totalSpent,
        averageRating: parseFloat(averageRating.toFixed(1)),
      },
      error: null,
    }
  } catch (error) {
    return { data: null, error }
  }
}

// Create new shift
export async function createShift(shiftData: Partial<Shift>) {
  const { data, error } = await supabase
    .from('shifts')
    .insert({
      ...shiftData,
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  return { data, error }
}

// Update shift
export async function updateShift(shiftId: string, updates: Partial<Shift>) {
  const { data, error } = await supabase
    .from('shifts')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', shiftId)
    .select()
    .single()

  return { data, error }
}

// Cancel shift
export async function cancelShift(shiftId: string) {
  return updateShift(shiftId, { status: 'cancelled' })
}

// Complete shift
export async function completeShift(shiftId: string) {
  return updateShift(shiftId, { status: 'completed' })
}

// Get shef's active shifts (shifts where shef is managing)
export async function getShefActiveShifts(shefId: string) {
  // For now, shef manages all shifts created by their associated client
  // In production, you'd have a shef_id field on shifts table
  const { data, error } = await supabase
    .from('shifts')
    .select('*')
    .in('status', ['open', 'in_progress'])
    .order('date', { ascending: true })

  return { data, error }
}

// Get shift with all workers and their statuses
export async function getShiftWithWorkers(shiftId: string) {
  try {
    // Get shift
    const { data: shift, error: shiftError } = await getShiftById(shiftId)
    if (shiftError || !shift) {
      return { data: null, error: shiftError }
    }

    // Get shift workers with user details
    const { data: shiftWorkers, error: workersError } = await supabase
      .from('shift_workers')
      .select(`
        *,
        worker:users!shift_workers_worker_id_fkey(
          id,
          full_name,
          avatar_url,
          phone,
          rating
        )
      `)
      .eq('shift_id', shiftId)
      .order('created_at', { ascending: false })

    if (workersError) {
      return { data: null, error: workersError }
    }

    return {
      data: {
        ...shift,
        workers: shiftWorkers || [],
      },
      error: null,
    }
  } catch (err) {
    return { data: null, error: err }
  }
}