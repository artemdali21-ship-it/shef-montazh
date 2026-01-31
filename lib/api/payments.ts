import { createClient } from '@/lib/supabase-client'

export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'failed' | 'refunded'

export interface Payment {
  id: string
  shift_id: string
  client_id: string
  worker_id: string
  amount: number
  platform_fee: number
  status: PaymentStatus
  payment_method: string | null
  yukassa_payment_id: string | null
  paid_at: string | null
  created_at: string
  shift?: {
    id: string
    title: string
    date: string
    address: string
    start_time?: string
    end_time?: string
    category?: string
  }
  worker?: {
    id: string
    full_name: string
    avatar_url: string | null
    phone?: string
  }
  client?: {
    id: string
    full_name: string
    avatar_url: string | null
    phone?: string
  }
}

export interface PaymentFilters {
  status?: PaymentStatus | 'all'
  dateFrom?: string
  dateTo?: string
  sortBy?: 'date' | 'amount'
  sortOrder?: 'asc' | 'desc'
  page?: number
}

export interface PaymentsSummary {
  totalReceived?: number
  totalSpent?: number
  pending: number
  overdue: number
  toPay?: number
}

const ITEMS_PER_PAGE = 20

/**
 * Get worker payments with filters
 */
export async function getWorkerPayments(
  workerId: string,
  filters: PaymentFilters = {}
) {
  const supabase = createClient()

  try {
    const {
      status = 'all',
      dateFrom,
      dateTo,
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1
    } = filters

    let query = supabase
      .from('payments')
      .select(`
        *,
        shift:shifts (
          id,
          title,
          date,
          address
        ),
        client:users!payments_client_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `, { count: 'exact' })
      .eq('worker_id', workerId)

    // Filter by status
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    // Filter by date range
    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo)
    }

    // Sorting
    if (sortBy === 'date') {
      query = query.order('created_at', { ascending: sortOrder === 'asc' })
    } else if (sortBy === 'amount') {
      query = query.order('amount', { ascending: sortOrder === 'asc' })
    }

    // Pagination
    const offset = (page - 1) * ITEMS_PER_PAGE
    query = query.range(offset, offset + ITEMS_PER_PAGE - 1)

    const { data, error, count } = await query

    if (error) throw error

    return {
      data: data || [],
      count: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE)
    }
  } catch (err) {
    console.error('Error getting worker payments:', err)
    return { data: [], count: 0, page: 1, totalPages: 0 }
  }
}

/**
 * Get client payments with filters
 */
export async function getClientPayments(
  clientId: string,
  filters: PaymentFilters = {}
) {
  const supabase = createClient()

  try {
    const {
      status = 'all',
      dateFrom,
      dateTo,
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1
    } = filters

    let query = supabase
      .from('payments')
      .select(`
        *,
        shift:shifts (
          id,
          title,
          date,
          address
        ),
        worker:users!payments_worker_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `, { count: 'exact' })
      .eq('client_id', clientId)

    // Filter by status
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    // Filter by date range
    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo)
    }

    // Sorting
    if (sortBy === 'date') {
      query = query.order('created_at', { ascending: sortOrder === 'asc' })
    } else if (sortBy === 'amount') {
      query = query.order('amount', { ascending: sortOrder === 'asc' })
    }

    // Pagination
    const offset = (page - 1) * ITEMS_PER_PAGE
    query = query.range(offset, offset + ITEMS_PER_PAGE - 1)

    const { data, error, count } = await query

    if (error) throw error

    return {
      data: data || [],
      count: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE)
    }
  } catch (err) {
    console.error('Error getting client payments:', err)
    return { data: [], count: 0, page: 1, totalPages: 0 }
  }
}

/**
 * Get worker payments summary
 */
export async function getWorkerPaymentsSummary(workerId: string): Promise<PaymentsSummary> {
  const supabase = createClient()

  try {
    // Total received (paid)
    const { data: paidData } = await supabase
      .from('payments')
      .select('amount')
      .eq('worker_id', workerId)
      .eq('status', 'paid')

    const totalReceived = (paidData || []).reduce((sum, p) => sum + Number(p.amount), 0)

    // Pending
    const { data: pendingData } = await supabase
      .from('payments')
      .select('amount')
      .eq('worker_id', workerId)
      .eq('status', 'pending')

    const pending = (pendingData || []).reduce((sum, p) => sum + Number(p.amount), 0)

    // Overdue
    const { data: overdueData } = await supabase
      .from('payments')
      .select('amount')
      .eq('worker_id', workerId)
      .eq('status', 'overdue')

    const overdue = (overdueData || []).reduce((sum, p) => sum + Number(p.amount), 0)

    return {
      totalReceived,
      pending,
      overdue
    }
  } catch (err) {
    console.error('Error getting worker payments summary:', err)
    return {
      totalReceived: 0,
      pending: 0,
      overdue: 0
    }
  }
}

/**
 * Get client payments summary
 */
export async function getClientPaymentsSummary(clientId: string): Promise<PaymentsSummary> {
  const supabase = createClient()

  try {
    // Total spent (paid)
    const { data: paidData } = await supabase
      .from('payments')
      .select('amount')
      .eq('client_id', clientId)
      .eq('status', 'paid')

    const totalSpent = (paidData || []).reduce((sum, p) => sum + Number(p.amount), 0)

    // To pay (pending)
    const { data: pendingData } = await supabase
      .from('payments')
      .select('amount')
      .eq('client_id', clientId)
      .eq('status', 'pending')

    const toPay = (pendingData || []).reduce((sum, p) => sum + Number(p.amount), 0)

    // Overdue
    const { data: overdueData } = await supabase
      .from('payments')
      .select('amount')
      .eq('client_id', clientId)
      .eq('status', 'overdue')

    const overdue = (overdueData || []).reduce((sum, p) => sum + Number(p.amount), 0)

    return {
      totalSpent,
      pending: toPay,
      toPay,
      overdue
    }
  } catch (err) {
    console.error('Error getting client payments summary:', err)
    return {
      totalSpent: 0,
      pending: 0,
      toPay: 0,
      overdue: 0
    }
  }
}

/**
 * Get payment by ID with full details
 */
export async function getPaymentById(paymentId: string) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        shift:shifts (
          id,
          title,
          date,
          address,
          start_time,
          end_time,
          category
        ),
        worker:users!payments_worker_id_fkey (
          id,
          full_name,
          avatar_url,
          phone
        ),
        client:users!payments_client_id_fkey (
          id,
          full_name,
          avatar_url,
          phone
        )
      `)
      .eq('id', paymentId)
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (err) {
    console.error('Error getting payment:', err)
    return { data: null, error: err as Error }
  }
}

/**
 * Export payments to Excel/CSV format
 */
export async function exportPaymentsData(userId: string, role: 'worker' | 'client') {
  const supabase = createClient()

  try {
    let query = supabase
      .from('payments')
      .select(`
        *,
        shift:shifts (title, date),
        worker:users!payments_worker_id_fkey (full_name),
        client:users!payments_client_id_fkey (full_name)
      `)

    if (role === 'worker') {
      query = query.eq('worker_id', userId)
    } else {
      query = query.eq('client_id', userId)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) throw error

    return { data: data || [], error: null }
  } catch (err) {
    console.error('Error exporting payments:', err)
    return { data: [], error: err as Error }
  }
}

// Legacy functions for backward compatibility
export async function createPayment(paymentData: {
  shift_id: string
  client_id: string
  worker_id: string
  amount: number
  platform_fee?: number
  payment_method?: string
}) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('payments')
    .insert({
      ...paymentData,
      platform_fee: paymentData.platform_fee || 1200,
      status: 'pending'
    })
    .select()
    .single()

  return { data, error }
}

export async function updatePaymentStatus(
  paymentId: string,
  status: PaymentStatus,
  yukassaPaymentId?: string
) {
  const supabase = createClient()
  const updateData: any = { status }

  if (status === 'paid') {
    updateData.paid_at = new Date().toISOString()
  }

  if (yukassaPaymentId) {
    updateData.yukassa_payment_id = yukassaPaymentId
  }

  const { data, error } = await supabase
    .from('payments')
    .update(updateData)
    .eq('id', paymentId)
    .select()
    .single()

  return { data, error }
}
