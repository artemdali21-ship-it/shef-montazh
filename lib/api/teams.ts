import { supabase } from '../supabase'

export interface Team {
  id: string
  shef_id: string
  name: string
  worker_ids: string[]
  created_at: string
  updated_at: string
}

export interface TeamWithWorkers extends Team {
  workers: Array<{
    id: string
    full_name: string
    avatar_url: string | null
    rating: number
    total_shifts: number
  }>
}

// Get shef's teams
export async function getShefTeams(shefId: string) {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('shef_id', shefId)
    .order('created_at', { ascending: false })

  if (error) return { data: null, error }

  // Fetch worker details for each team
  if (data && data.length > 0) {
    const teamsWithWorkers = await Promise.all(
      data.map(async (team) => {
        if (!team.worker_ids || team.worker_ids.length === 0) {
          return { ...team, workers: [] }
        }

        const { data: workers } = await supabase
          .from('users')
          .select('id, full_name, avatar_url, rating, total_shifts')
          .in('id', team.worker_ids)

        return {
          ...team,
          workers: workers || [],
        }
      })
    )

    return { data: teamsWithWorkers, error: null }
  }

  return { data: [], error: null }
}

// Create new team
export async function createTeam(
  shefId: string,
  name: string,
  workerIds: string[] = []
) {
  const { data, error } = await supabase
    .from('teams')
    .insert({
      shef_id: shefId,
      name,
      worker_ids: workerIds,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  return { data, error }
}

// Add worker to team
export async function addWorkerToTeam(teamId: string, workerId: string) {
  // Get current team
  const { data: team, error: fetchError } = await supabase
    .from('teams')
    .select('worker_ids')
    .eq('id', teamId)
    .single()

  if (fetchError) return { data: null, error: fetchError }

  const currentWorkerIds = team?.worker_ids || []

  // Check if worker already in team
  if (currentWorkerIds.includes(workerId)) {
    return { data: null, error: new Error('Worker already in team') }
  }

  // Add worker
  const { data, error } = await supabase
    .from('teams')
    .update({
      worker_ids: [...currentWorkerIds, workerId],
      updated_at: new Date().toISOString(),
    })
    .eq('id', teamId)
    .select()
    .single()

  return { data, error }
}

// Remove worker from team
export async function removeWorkerFromTeam(teamId: string, workerId: string) {
  // Get current team
  const { data: team, error: fetchError } = await supabase
    .from('teams')
    .select('worker_ids')
    .eq('id', teamId)
    .single()

  if (fetchError) return { data: null, error: fetchError }

  const currentWorkerIds = team?.worker_ids || []

  // Remove worker
  const { data, error } = await supabase
    .from('teams')
    .update({
      worker_ids: currentWorkerIds.filter((id: string) => id !== workerId),
      updated_at: new Date().toISOString(),
    })
    .eq('id', teamId)
    .select()
    .single()

  return { data, error }
}

// Get team statistics
export async function getTeamStats(teamId: string) {
  try {
    // Get team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('worker_ids')
      .eq('id', teamId)
      .single()

    if (teamError || !team) {
      return { data: null, error: teamError }
    }

    const workerIds = team.worker_ids || []

    if (workerIds.length === 0) {
      return {
        data: {
          totalShifts: 0,
          completedShifts: 0,
          averageRating: 0,
        },
        error: null,
      }
    }

    // Get shifts where ALL team members were assigned
    const { data: shifts } = await supabase
      .from('shift_workers')
      .select('shift_id, status')
      .in('worker_id', workerIds)

    if (!shifts) {
      return {
        data: {
          totalShifts: 0,
          completedShifts: 0,
          averageRating: 0,
        },
        error: null,
      }
    }

    // Count shifts where all workers participated
    const shiftCounts: Record<string, number> = {}
    shifts.forEach((sw: any) => {
      shiftCounts[sw.shift_id] = (shiftCounts[sw.shift_id] || 0) + 1
    })

    const completeTeamShifts = Object.values(shiftCounts).filter(
      (count) => count === workerIds.length
    ).length

    // Calculate average team rating
    const { data: workers } = await supabase
      .from('users')
      .select('rating')
      .in('id', workerIds)

    const avgRating = workers
      ? workers.reduce((sum: number, w: any) => sum + (w.rating || 0), 0) / workers.length
      : 0

    return {
      data: {
        totalShifts: completeTeamShifts,
        completedShifts: completeTeamShifts,
        averageRating: parseFloat(avgRating.toFixed(1)),
      },
      error: null,
    }
  } catch (err) {
    return { data: null, error: err }
  }
}

// Update team
export async function updateTeam(
  teamId: string,
  updates: { name?: string; worker_ids?: string[] }
) {
  const { data, error } = await supabase
    .from('teams')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', teamId)
    .select()
    .single()

  return { data, error }
}

// Delete team
export async function deleteTeam(teamId: string) {
  const { error } = await supabase.from('teams').delete().eq('id', teamId)

  return { error }
}
