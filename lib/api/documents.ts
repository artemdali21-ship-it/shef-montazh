import { createClient } from '@/lib/supabase-client'

export interface Document {
  id: string
  user_id: string
  shift_id: string | null
  type: 'act' | 'receipt' | 'contract'
  title: string
  file_url: string | null
  created_at: string
}

/**
 * Get all documents for a user
 */
export async function getUserDocuments(userId: string): Promise<{ data: Document[], error: any }> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error fetching documents:', error)
    return { data: [], error }
  }
}

/**
 * Create a new document record
 */
export async function createDocument(
  userId: string,
  shiftId: string | null,
  type: 'act' | 'receipt' | 'contract',
  title: string,
  fileUrl: string | null
): Promise<{ data: Document | null, error: any }> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('documents')
      .insert({
        user_id: userId,
        shift_id: shiftId,
        type,
        title,
        file_url: fileUrl
      })
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error creating document:', error)
    return { data: null, error }
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(documentId: string): Promise<{ error: any }> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)

    if (error) throw error

    return { error: null }
  } catch (error) {
    console.error('Error deleting document:', error)
    return { error }
  }
}

/**
 * Get documents by shift ID
 */
export async function getShiftDocuments(shiftId: string): Promise<{ data: Document[], error: any }> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('shift_id', shiftId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error fetching shift documents:', error)
    return { data: [], error }
  }
}
