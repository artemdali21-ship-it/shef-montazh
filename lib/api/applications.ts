import { supabase } from '../supabase'

export interface Application {
  id: string
  shift_id: string
  worker_id: string
  message?: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
}

// Get all applications for a shift with worker profile
export async function getShiftApplications(shiftId: string) {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      worker:users!applications_worker_id_fkey(
        id,
        full_name,
        avatar_url,
        rating,
        total_shifts,
        gosuslugi_verified,
        role
      )
    `)
    .eq('shift_id', shiftId)
    .order('created_at', { ascending: false })

  if (error) return { data: null, error }

  // Fetch worker profiles for all applications
  if (data && data.length > 0) {
    const workerIds = data.map((app: any) => app.worker_id)

    const { data: workerProfiles } = await supabase
      .from('worker_profiles')
      .select('user_id, categories, bio')
      .in('user_id', workerIds)

    // Attach worker profiles to applications
    const applicationsWithProfiles = data.map((app: any) => {
      const profile = workerProfiles?.find((p: any) => p.user_id === app.worker_id)
      return {
        ...app,
        worker: {
          ...app.worker,
          profile: profile || null
        }
      }
    })

    return { data: applicationsWithProfiles, error: null }
  }

  return { data, error }
}

// Get all applications by worker
export async function getWorkerApplications(workerId: string) {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      shift:shifts(
        id,
        title,
        category,
        location_address,
        date,
        start_time,
        end_time,
        pay_amount,
        status
      )
    `)
    .eq('worker_id', workerId)
    .order('created_at', { ascending: false })

  return { data, error }
}

// Get application by ID
export async function getApplicationById(applicationId: string) {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('id', applicationId)
    .single()

  return { data, error }
}

// Check if worker already applied to shift
export async function checkExistingApplication(shiftId: string, workerId: string) {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('shift_id', shiftId)
    .eq('worker_id', workerId)
    .single()

  return { data, error }
}

// Create new application
export async function createApplication(applicationData: {
  shift_id: string
  worker_id: string
  message?: string
}) {
  // First check if application already exists
  const { data: existing } = await checkExistingApplication(
    applicationData.shift_id,
    applicationData.worker_id
  )

  if (existing) {
    return { 
      data: null, 
      error: new Error('You have already applied to this shift') 
    }
  }

  const { data, error } = await supabase
    .from('applications')
    .insert({
      ...applicationData,
      status: 'pending',
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  return { data, error }
}

// Accept application and add worker to shift_workers
export async function acceptApplication(applicationId: string) {
  // Get application details
  const { data: application, error: appError } = await supabase
    .from('applications')
    .select('*')
    .eq('id', applicationId)
    .single()

  if (appError || !application) {
    return { data: null, error: appError || new Error('Application not found') }
  }

  // Update application status
  const { data, error } = await supabase
    .from('applications')
    .update({ status: 'accepted' })
    .eq('id', applicationId)
    .select()
    .single()

  if (error) return { data: null, error }

  // Add worker to shift_workers table
  const { error: shiftWorkerError } = await supabase
    .from('shift_workers')
    .insert({
      shift_id: application.shift_id,
      worker_id: application.worker_id,
      status: 'confirmed',
      created_at: new Date().toISOString()
    })

  if (shiftWorkerError) {
    console.error('Error adding to shift_workers:', shiftWorkerError)
    // Don't return error - application is already accepted
  }

  return { data, error: null }
}

// Reject application
export async function rejectApplication(applicationId: string) {
  const { data, error } = await supabase
    .from('applications')
    .update({ status: 'rejected' })
    .eq('id', applicationId)
    .select()
    .single()

  return { data, error }
}

// Cancel application (worker cancels their own application)
export async function cancelApplication(applicationId: string, workerId: string) {
  // Verify the application belongs to this worker
  const { data: application } = await getApplicationById(applicationId)

  if (!application || application.worker_id !== workerId) {
    return { 
      data: null, 
      error: new Error('Application not found or unauthorized') 
    }
  }

  const { data, error } = await supabase
    .from('applications')
    .delete()
    .eq('id', applicationId)
    .eq('worker_id', workerId)

  return { data, error }
}

// Get pending applications count for a shift
export async function getPendingApplicationsCount(shiftId: string) {
  const { count, error } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .eq('shift_id', shiftId)
    .eq('status', 'pending')

  return { count, error }
}

// Get all applications count for a shift
export async function getApplicationsCount(shiftId: string) {
  const { count, error } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .eq('shift_id', shiftId)

  return { count, error }
}

// Get accepted applications for a shift
export async function getAcceptedApplications(shiftId: string) {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      worker:users!applications_worker_id_fkey(
        id,
        full_name,
        phone,
        avatar_url,
        rating,
        total_shifts
      )
    `)
    .eq('shift_id', shiftId)
    .eq('status', 'accepted')

  return { data, error }
}
