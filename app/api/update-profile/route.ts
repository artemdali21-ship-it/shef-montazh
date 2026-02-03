import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { userId, bio, phone, avatarUrl } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    console.log('[API update-profile] Updating profile for user:', userId)

    // Step 1: Update users table (avatar_url and full_name)
    if (avatarUrl) {
      console.log('[API update-profile] Updating avatar_url in users table')
      const { error: userError } = await supabase
        .from('users')
        .update({ avatar_url: avatarUrl })
        .eq('id', userId)

      if (userError) {
        console.error('[API update-profile] Error updating users table:', userError)
        throw userError
      }
    }

    // Step 2: Update or create worker_profiles
    console.log('[API update-profile] Updating worker_profiles')

    // First try to update
    const { data: existingProfile, error: selectError } = await supabase
      .from('worker_profiles')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (selectError && selectError.code !== 'PGRST116') {
      // PGRST116 means no rows found - that's ok
      throw selectError
    }

    if (existingProfile) {
      // Profile exists - update it
      const { error: updateError } = await supabase
        .from('worker_profiles')
        .update({
          bio: bio || null,
          phone: phone || null,
          avatar_url: avatarUrl || null,
        })
        .eq('user_id', userId)

      if (updateError) {
        console.error('[API update-profile] Error updating profile:', updateError)
        throw updateError
      }
      console.log('[API update-profile] ✅ Profile updated')
    } else {
      // Profile doesn't exist - create it
      const { error: insertError } = await supabase
        .from('worker_profiles')
        .insert({
          user_id: userId,
          bio: bio || null,
          phone: phone || null,
          avatar_url: avatarUrl || null,
        })

      if (insertError) {
        console.error('[API update-profile] Error creating profile:', insertError)
        throw insertError
      }
      console.log('[API update-profile] ✅ Profile created')
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    })
  } catch (error: any) {
    console.error('[API update-profile] Error:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Failed to update profile',
        details: error.details
      },
      { status: 500 }
    )
  }
}
