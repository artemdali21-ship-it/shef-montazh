import { createClient } from '@/lib/supabase-client'

export interface Team {
  id: string
  shef_id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  team_id: string
  worker_id: string
  added_at: string
}

export interface TeamWithMembers extends Team {
  team_members: {
    worker: {
      id: string
      full_name: string
      avatar_url: string | null
      rating?: number
    }
  }[]
}

/**
 * Get all teams for a shef
 */
export async function getShefTeams(shefId: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        team_members (
          worker:users (
            id,
            full_name,
            avatar_url,
            worker_profiles (
              rating
            )
          )
        )
      `)
      .eq('shef_id', shefId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { data: data || [], error: null }
  } catch (err) {
    console.error('Error getting teams:', err)
    return { data: [], error: err as Error }
  }
}

/**
 * Get team by ID with members
 */
export async function getTeamById(teamId: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        team_members (
          *,
          worker:users (
            id,
            full_name,
            avatar_url,
            phone,
            worker_profiles (
              rating,
              categories
            )
          )
        )
      `)
      .eq('id', teamId)
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (err) {
    console.error('Error getting team:', err)
    return { data: null, error: err as Error }
  }
}

/**
 * Create a new team
 */
export async function createTeam(shefId: string, name: string, description?: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('teams')
      .insert({
        shef_id: shefId,
        name,
        description: description || null
      })
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (err) {
    console.error('Error creating team:', err)
    return { data: null, error: err as Error }
  }
}

/**
 * Update team
 */
export async function updateTeam(teamId: string, updates: Partial<Pick<Team, 'name' | 'description'>>) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('teams')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', teamId)
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (err) {
    console.error('Error updating team:', err)
    return { data: null, error: err as Error }
  }
}

/**
 * Delete team
 */
export async function deleteTeam(teamId: string) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId)

    if (error) throw error

    return { error: null }
  } catch (err) {
    console.error('Error deleting team:', err)
    return { error: err as Error }
  }
}

/**
 * Add member to team
 */
export async function addTeamMember(teamId: string, workerId: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        worker_id: workerId
      })
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (err) {
    console.error('Error adding team member:', err)
    return { data: null, error: err as Error }
  }
}

/**
 * Remove member from team
 */
export async function removeTeamMember(memberId: string) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId)

    if (error) throw error

    return { error: null }
  } catch (err) {
    console.error('Error removing team member:', err)
    return { error: err as Error }
  }
}

/**
 * Get team members
 */
export async function getTeamMembers(teamId: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        *,
        worker:users (
          id,
          full_name,
          avatar_url,
          phone,
          worker_profiles (
            rating,
            categories
          )
        )
      `)
      .eq('team_id', teamId)
      .order('added_at', { ascending: false })

    if (error) throw error

    return { data: data || [], error: null }
  } catch (err) {
    console.error('Error getting team members:', err)
    return { data: [], error: err as Error }
  }
}

/**
 * Get team statistics for Shef dashboard
 */
export async function getTeamStats(shefId: string) {
  // TODO: Implement team statistics
  return {
    totalTeams: 0,
    totalMembers: 0,
    activeMembers: 0,
    averageRating: 0
  }
}
