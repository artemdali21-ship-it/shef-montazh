import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import AdminSidebar from '@/components/admin/AdminSidebar'

export const metadata = {
  title: 'Админ-панель | ШЕФ-МОНТАЖ',
  description: 'Административная панель управления платформой'
}

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/auth/login')
  }

  // Check admin role
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role, full_name, avatar_url')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    redirect('/')
  }

  if (profile.role !== 'admin' && profile.role !== 'shef') {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen bg-dashboard">
      <AdminSidebar user={{ ...user, ...profile }} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
