import { createClient } from '@/lib/supabase-server'
import UserTable from '@/components/admin/UserTable'
import UserFilters from '@/components/admin/UserFilters'

interface SearchParams {
  role?: string
  status?: string
  search?: string
}

async function getUsers(searchParams: SearchParams) {
  const supabase = createClient()

  let query = supabase
    .from('users')
    .select(`
      *,
      worker_profiles(
        status,
        ban_reason,
        ban_until,
        verification_status
      )
    `)

  // Filter by role
  if (searchParams.role && searchParams.role !== 'all') {
    query = query.eq('role', searchParams.role)
  }

  // Filter by status
  if (searchParams.status && searchParams.status !== 'all') {
    if (searchParams.status === 'banned') {
      query = query.eq('worker_profiles.status', 'banned')
    } else if (searchParams.status === 'active') {
      query = query.or('worker_profiles.status.is.null,worker_profiles.status.neq.banned')
    }
  }

  // Search by name or email
  if (searchParams.search) {
    query = query.or(`full_name.ilike.%${searchParams.search}%,email.ilike.%${searchParams.search}%`)
  }

  const { data: users, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching users:', error)
    return []
  }

  return users || []
}

export default async function AdminUsersPage({
  searchParams
}: {
  searchParams: SearchParams
}) {
  const users = await getUsers(searchParams)

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Управление пользователями</h1>
        <p className="text-gray-400">Просмотр и управление всеми пользователями платформы</p>
      </div>

      {/* Filters */}
      <UserFilters />

      {/* Users Table */}
      <UserTable users={users} />
    </div>
  )
}
