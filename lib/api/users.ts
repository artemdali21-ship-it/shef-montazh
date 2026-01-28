import { supabase } from '../supabase'

export interface User {
  id: string
  phone: string
  full_name: string
  role: 'worker' | 'client' | 'shef'
  avatar_url?: string
  is_verified: boolean
  gosuslugi_verified: boolean
  rating: number
  total_shifts: number
  successful_shifts: number
  created_at: string
  updated_at: string
}

// Get user by ID
export async function getUserById(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  return { data, error }
}

// Get user by phone
export async function getUserByPhone(phone: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('phone', phone)
    .maybeSingle()

  return { data, error }
}

// Create new user
export async function createUser(userData: Partial<User>) {
  const { data, error } = await supabase
    .from('users')
    .insert([userData])
    .select()
    .single()

  return { data, error }
}

// Update user
export async function updateUser(userId: string, updates: Partial<User>) {
  const { data, error } = await supabase
    .from('users')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single()

  return { data, error }
}

// Update user rating after shift
export async function updateUserRating(userId: string, newRating: number) {
  const { data: user } = await getUserById(userId)
  
  if (!user) return { data: null, error: new Error('User not found') }

  const totalShifts = user.total_shifts
  const currentRating = user.rating
  const updatedRating = ((currentRating * totalShifts) + newRating) / (totalShifts + 1)

  return updateUser(userId, {
    rating: parseFloat(updatedRating.toFixed(2)),
    total_shifts: totalShifts + 1
  })
}

// Get all users (with optional filters)
export async function getAllUsers(filters?: {
  role?: 'worker' | 'client' | 'shef'
  verified?: boolean
  limit?: number
}) {
  let query = supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters?.role) {
    query = query.eq('role', filters.role)
  }

  if (filters?.verified !== undefined) {
    query = query.eq('gosuslugi_verified', filters.verified)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  return await query
}