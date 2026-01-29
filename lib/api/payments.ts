import { supabase } from '../supabase'

export interface Payment {
  id: string
  shift_id: string
  client_id: string
  worker_id: string
  amount: number
  platform_fee: number
  status: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_method?: string
  yukassa_payment_id?: string
  paid_at?: string
  created_at: string
}

// Get payment by ID
export async function getPaymentById(paymentId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .single()

  return { data, error }
}

// Get payment by shift ID
export async function getPaymentByShiftId(shiftId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('shift_id', shiftId)
    .single()

  return { data, error }
}

// Get all payments for a client
export async function getClientPayments(clientId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  return { data, error }
}

// Get all payments for a worker
export async function getWorkerPayments(workerId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('worker_id', workerId)
    .order('created_at', { ascending: false })

  return { data, error }
}

// Create payment
export async function createPayment(paymentData: {
  shift_id: string
  client_id: string
  worker_id: string
  amount: number
  platform_fee?: number
  payment_method?: string
}) {
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

// Update payment status
export async function updatePaymentStatus(
  paymentId: string,
  status: 'pending' | 'paid' | 'failed' | 'refunded',
  yukassaPaymentId?: string
) {
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

// Mark payment as paid
export async function markPaymentAsPaid(paymentId: string, yukassaPaymentId?: string) {
  return updatePaymentStatus(paymentId, 'paid', yukassaPaymentId)
}

// Mark payment as failed
export async function markPaymentAsFailed(paymentId: string) {
  return updatePaymentStatus(paymentId, 'failed')
}

// Refund payment
export async function refundPayment(paymentId: string) {
  return updatePaymentStatus(paymentId, 'refunded')
}

// Get pending payments count for client
export async function getPendingPaymentsCount(clientId: string) {
  const { count, error } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', clientId)
    .eq('status', 'pending')

  return { count, error }
}

// Get total earned by worker
export async function getWorkerTotalEarnings(workerId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('amount')
    .eq('worker_id', workerId)
    .eq('status', 'paid')

  if (error || !data) return { total: 0, error }

  const total = data.reduce((sum, payment) => sum + payment.amount, 0)
  return { total, error: null }
}

// Get total spent by client
export async function getClientTotalSpent(clientId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('amount, platform_fee')
    .eq('client_id', clientId)
    .eq('status', 'paid')

  if (error || !data) return { total: 0, error }

  const total = data.reduce((sum, payment) => sum + payment.amount + payment.platform_fee, 0)
  return { total, error: null }
}
