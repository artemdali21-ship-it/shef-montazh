import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/admin/stats
 * Get platform-wide statistics
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const period = searchParams.get('period') || 'month'

    // Calculate date range
    const now = new Date()
    let startDate = new Date()

    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0)
        break
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'all':
        startDate = new Date(0) // Beginning of time
        break
    }

    // Get user counts
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    const { count: totalWorkers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'worker')

    const { count: totalClients } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'client')

    const { count: totalShefs } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'shef')

    const { count: totalAdmins } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin')

    // Get shift counts
    const { count: totalShifts } = await supabase
      .from('shifts')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())

    const { count: activeShifts } = await supabase
      .from('shifts')
      .select('*', { count: 'exact', head: true })
      .in('status', ['published', 'applications', 'accepted'])

    const { count: inProgressShifts } = await supabase
      .from('shifts')
      .select('*', { count: 'exact', head: true })
      .in('status', ['checking_in', 'in_progress'])

    const { count: completedShifts } = await supabase
      .from('shifts')
      .select('*', { count: 'exact', head: true })
      .in('status', ['completed', 'reviewed'])
      .gte('created_at', startDate.toISOString())

    const { count: cancelledShifts } = await supabase
      .from('shifts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'cancelled')
      .gte('created_at', startDate.toISOString())

    // Get payment stats
    const { data: payments } = await supabase
      .from('payments')
      .select('amount, platform_fee, status')
      .gte('created_at', startDate.toISOString())

    const successfulPayments = payments
      ?.filter(p => p.status === 'succeeded')
      .reduce((sum, p) => sum + Number(p.amount), 0) || 0

    const pendingPayments = payments
      ?.filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + Number(p.amount), 0) || 0

    const failedPayments = payments
      ?.filter(p => p.status === 'failed' || p.status === 'canceled')
      .reduce((sum, p) => sum + Number(p.amount), 0) || 0

    const refundedPayments = payments
      ?.filter(p => p.status === 'refunded')
      .reduce((sum, p) => sum + Number(p.amount), 0) || 0

    const platformFees = payments
      ?.filter(p => p.status === 'succeeded')
      .reduce((sum, p) => sum + Number(p.platform_fee || 0), 0) || 0

    const totalRevenue = successfulPayments

    // Get application stats
    const { count: totalApplications } = await supabase
      .from('shift_applications')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())

    const { count: acceptedApplications } = await supabase
      .from('shift_applications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'accepted')
      .gte('created_at', startDate.toISOString())

    // Get rating stats
    const { data: ratings } = await supabase
      .from('ratings')
      .select('rating')
      .gte('created_at', startDate.toISOString())

    const totalReviews = ratings?.length || 0
    const avgRating = totalReviews > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0

    return NextResponse.json({
      totalUsers,
      totalWorkers,
      totalClients,
      totalShefs,
      totalAdmins,
      totalShifts,
      activeShifts,
      inProgressShifts,
      completedShifts,
      cancelledShifts,
      successfulPayments,
      pendingPayments,
      failedPayments,
      refundedPayments,
      totalRevenue,
      platformFees,
      totalApplications,
      acceptedApplications,
      totalReviews,
      avgRating,
      period
    })
  } catch (error: any) {
    console.error('[Admin Stats] Error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
