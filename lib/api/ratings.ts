import { supabase } from '../supabase'

export interface Rating {
  id: string
  shift_id: string
  from_user_id: string
  to_user_id: string
  rating: number
  comment?: string
  created_at: string
}

// Create rating
export async function createRating(ratingData: {
  shift_id: string
  from_user_id: string
  to_user_id: string
  rating: number
  comment?: string
}) {
  const { data, error } = await supabase
    .from('ratings')
    .insert({
      ...ratingData,
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  return { data, error }
}

// Get ratings for a shift
export async function getShiftRatings(shiftId: string) {
  const { data, error } = await supabase
    .from('ratings')
    .select(`
      *,
      from_user:users!ratings_from_user_id_fkey(
        id,
        full_name,
        avatar_url,
        role
      ),
      to_user:users!ratings_to_user_id_fkey(
        id,
        full_name,
        avatar_url,
        role
      )
    `)
    .eq('shift_id', shiftId)
    .order('created_at', { ascending: false })

  return { data, error }
}

// Get ratings received by user
export async function getUserReceivedRatings(userId: string) {
  const { data, error } = await supabase
    .from('ratings')
    .select(`
      *,
      from_user:users!ratings_from_user_id_fkey(
        id,
        full_name,
        avatar_url,
        role
      ),
      shift:shifts(
        id,
        title,
        date
      )
    `)
    .eq('to_user_id', userId)
    .order('created_at', { ascending: false })

  return { data, error }
}

// Get ratings given by user
export async function getUserGivenRatings(userId: string) {
  const { data, error } = await supabase
    .from('ratings')
    .select(`
      *,
      to_user:users!ratings_to_user_id_fkey(
        id,
        full_name,
        avatar_url,
        role
      ),
      shift:shifts(
        id,
        title,
        date
      )
    `)
    .eq('from_user_id', userId)
    .order('created_at', { ascending: false })

  return { data, error }
}

// Calculate average rating for user
export async function calculateUserAverageRating(userId: string) {
  const { data, error } = await supabase
    .from('ratings')
    .select('rating')
    .eq('to_user_id', userId)

  if (error || !data || data.length === 0) {
    return { average: 0, count: 0, error }
  }

  const sum = data.reduce((acc, curr) => acc + curr.rating, 0)
  const average = sum / data.length

  return {
    average: Math.round(average * 10) / 10, // Round to 1 decimal
    count: data.length,
    error: null
  }
}

// Check if rating exists
export async function checkRatingExists(
  shiftId: string,
  fromUserId: string,
  toUserId: string
) {
  const { data, error } = await supabase
    .from('ratings')
    .select('id')
    .eq('shift_id', shiftId)
    .eq('from_user_id', fromUserId)
    .eq('to_user_id', toUserId)
    .maybeSingle()

  return { exists: !!data, error }
}

// Get rating by ID
export async function getRatingById(ratingId: string) {
  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('id', ratingId)
    .single()

  return { data, error }
}

// Get specific rating between two users for a shift
export async function getRating(
  shiftId: string,
  fromUserId: string,
  toUserId: string
) {
  const { data, error } = await supabase
    .from('ratings')
    .select(`
      *,
      to_user:users!ratings_to_user_id_fkey(
        id,
        full_name,
        avatar_url,
        role
      )
    `)
    .eq('shift_id', shiftId)
    .eq('from_user_id', fromUserId)
    .eq('to_user_id', toUserId)
    .maybeSingle()

  return { data, error }
}

// Check if user can rate for a shift
export async function canRate(shiftId: string, userId: string) {
  try {
    // Get shift details
    const { data: shift, error: shiftError } = await supabase
      .from('shifts')
      .select('status, client_id')
      .eq('id', shiftId)
      .single()

    if (shiftError || !shift) {
      return { canRate: false, error: shiftError }
    }

    // Only completed shifts can be rated
    if (shift.status !== 'completed') {
      return { canRate: false, error: null, reason: 'Shift not completed' }
    }

    // Check if user is the client
    if (shift.client_id === userId) {
      return { canRate: true, error: null }
    }

    // Check if user is assigned as worker
    const { data: workerAssignment, error: workerError } = await supabase
      .from('shift_workers')
      .select('id')
      .eq('shift_id', shiftId)
      .eq('worker_id', userId)
      .maybeSingle()

    if (workerError) {
      return { canRate: false, error: workerError }
    }

    return { canRate: !!workerAssignment, error: null }
  } catch (err) {
    return { canRate: false, error: err }
  }
}

// Update user's rating in users table
export async function updateUserRating(userId: string) {
  try {
    // Calculate new average
    const { average, count } = await calculateUserAverageRating(userId)

    // Update users table
    const { error } = await supabase
      .from('users')
      .update({ rating: average })
      .eq('id', userId)

    return { success: !error, error }
  } catch (err) {
    return { success: false, error: err }
  }
}
