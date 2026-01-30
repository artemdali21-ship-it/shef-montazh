import { supabase } from '../supabase'

export type ShiftWorkerStatus = 'confirmed' | 'on_way' | 'checked_in' | 'checked_out' | 'completed'

export interface ShiftWorker {
  id: string
  shift_id: string
  worker_id: string
  status: ShiftWorkerStatus
  check_in_time: string | null
  check_in_lat: number | null
  check_in_lng: number | null
  check_in_photo_url: string | null
  check_out_time: string | null
  created_at: string
}

// Get worker shift status
export async function getWorkerShiftStatus(shiftId: string, workerId: string) {
  const { data, error } = await supabase
    .from('shift_workers')
    .select('*')
    .eq('shift_id', shiftId)
    .eq('worker_id', workerId)
    .single()

  return { data, error }
}

// Update shift worker status
export async function updateShiftWorkerStatus(
  shiftId: string,
  workerId: string,
  status: ShiftWorkerStatus
) {
  const { data, error } = await supabase
    .from('shift_workers')
    .update({ status })
    .eq('shift_id', shiftId)
    .eq('worker_id', workerId)
    .select()
    .single()

  return { data, error }
}

// Check in worker with photo and geolocation
export async function checkInWorker(
  shiftId: string,
  workerId: string,
  photoFile: File,
  lat: number,
  lng: number
) {
  try {
    // Upload photo to Supabase Storage
    const fileExt = photoFile.name.split('.').pop()
    const fileName = `${shiftId}-${workerId}-${Date.now()}.${fileExt}`
    const filePath = `check-ins/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('shift-photos')
      .upload(filePath, photoFile, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { data: null, error: uploadError }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('shift-photos')
      .getPublicUrl(filePath)

    const photoUrl = urlData.publicUrl

    // Update shift_workers record
    const { data, error } = await supabase
      .from('shift_workers')
      .update({
        status: 'checked_in',
        check_in_time: new Date().toISOString(),
        check_in_lat: lat,
        check_in_lng: lng,
        check_in_photo_url: photoUrl,
      })
      .eq('shift_id', shiftId)
      .eq('worker_id', workerId)
      .select()
      .single()

    return { data, error }
  } catch (err) {
    console.error('Check-in error:', err)
    return { data: null, error: err }
  }
}

// Check out worker
export async function checkOutWorker(shiftId: string, workerId: string) {
  const { data, error } = await supabase
    .from('shift_workers')
    .update({
      status: 'checked_out',
      check_out_time: new Date().toISOString(),
    })
    .eq('shift_id', shiftId)
    .eq('worker_id', workerId)
    .select()
    .single()

  return { data, error }
}

// Get all workers for a shift
export async function getShiftWorkers(shiftId: string) {
  const { data, error } = await supabase
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

  return { data, error }
}
