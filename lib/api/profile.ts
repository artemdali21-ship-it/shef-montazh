import { supabase } from '../supabase'
import { updateUser } from './users'

// Upload avatar to Supabase Storage
export async function uploadAvatar(userId: string, file: File) {
  try {
    // Create unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { data: null, error: uploadError }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    return { data: urlData.publicUrl, error: null }
  } catch (err) {
    console.error('Upload avatar error:', err)
    return { data: null, error: err }
  }
}

// Update user profile (basic info)
export async function updateUserProfile(
  userId: string,
  updates: {
    full_name?: string
    phone?: string
    avatar_url?: string
    bio?: string
  }
) {
  return updateUser(userId, updates)
}

// Update worker profile (categories, etc.)
export async function updateWorkerProfile(
  userId: string,
  updates: {
    categories?: string[]
    bio?: string
    hourly_rate?: number
  }
) {
  const { data, error } = await supabase
    .from('worker_profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single()

  return { data, error }
}

// Update client profile
export async function updateClientProfile(
  userId: string,
  updates: {
    company_name?: string
    bio?: string
  }
) {
  const { data, error } = await supabase
    .from('client_profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single()

  return { data, error }
}

// Get current user profile with role-specific data
export async function getCurrentUserProfile(userId: string) {
  // Get base user data
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (userError) return { data: null, error: userError }

  // Get role-specific profile
  let profile = null
  if (user.role === 'worker') {
    const { data: workerProfile } = await supabase
      .from('worker_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    profile = workerProfile
  } else if (user.role === 'client') {
    const { data: clientProfile } = await supabase
      .from('client_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    profile = clientProfile
  }

  return { data: { ...user, profile }, error: null }
}
