import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import DisputeDetailsClient from '@/components/admin/DisputeDetailsClient'

async function getDispute(id: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('disputes')
    .select(`
      *,
      shift:shifts(*),
      creator:users!disputes_created_by_fkey(id, full_name, email, avatar_url, phone, role),
      against:users!disputes_against_user_fkey(id, full_name, email, avatar_url, phone, role),
      resolver:users!disputes_resolved_by_fkey(full_name)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching dispute:', error)
    return null
  }

  return data
}

export default async function AdminDisputeDetailPage({
  params
}: {
  params: { id: string }
}) {
  const dispute = await getDispute(params.id)

  if (!dispute) {
    redirect('/admin/disputes')
  }

  return <DisputeDetailsClient dispute={dispute as any} />
}
