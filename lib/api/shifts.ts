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
  try {
    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .order('created_at', { ascending: false })

    // Check if error is about table not found - various error formats
    if (error && (
      error.code === 'PGRST116' || 
      error.message?.includes('Could not find the table') ||
      error.message?.includes('42P01')
    )) {
      // Table doesn't exist - return mock data
      return [
        {
          id: '1',
          client_id: 'CL-001',
          title: 'Монтаж выставочного стенда',
          category: 'Монтажник',
          location_address: 'Crocus Expo, павильон 3',
          date: '2026-01-28',
          start_time: '18:00',
          end_time: '02:00',
          pay_amount: 2500,
          required_workers: 1,
          required_rating: 4.0,
          status: 'open',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    }

    if (error) {
      console.error('Error fetching shifts:', error)
      // Return mock data on any error to prevent page break
      return [
        {
          id: '1',
          client_id: 'CL-001',
          title: 'Монтаж выставочного стенда',
          category: 'Монтажник',
          location_address: 'Crocus Expo, павильон 3',
          date: '2026-01-28',
          start_time: '18:00',
          end_time: '02:00',
          pay_amount: 2500,
          required_workers: 1,
          required_rating: 4.0,
          status: 'open',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    }

    return data || []
  } catch (error) {
    console.error('Error fetching shifts (catch):', error)
    // Return mock data on complete failure
    return [
      {
        id: '1',
        client_id: 'CL-001',
        title: 'Монтаж выставочного стенда',
        category: 'Монтажник',
        location_address: 'Crocus Expo, павильон 3',
        date: '2026-01-28',
        start_time: '18:00',
        end_time: '02:00',
        pay_amount: 2500,
        required_workers: 1,
        required_rating: 4.0,
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  }
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

// Get shifts created by client
export async function getClientShifts(clientId: string) {
  const { data, error } = await supabase
    .from('shifts')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  return { data, error }
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
