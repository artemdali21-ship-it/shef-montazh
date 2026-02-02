import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface CompletionActData {
  shiftId: string
  clientId: string
  workerId: string
  shiftTitle: string
  shiftDate: string
  shiftDuration: string
  payAmount: number
  clientName: string
  workerName: string
  completedAt: string
}

/**
 * Generate completion act document
 */
export async function generateCompletionAct(data: CompletionActData): Promise<string> {
  const {
    shiftId,
    clientId,
    workerId,
    shiftTitle,
    shiftDate,
    shiftDuration,
    payAmount,
    clientName,
    workerName,
    completedAt
  } = data

  const actNumber = `ACT-${Date.now()}`
  const formattedDate = new Date(completedAt).toLocaleDateString('ru-RU')

  const actContent = `
АКТ ВЫПОЛНЕННЫХ РАБОТ
№ ${actNumber}

Дата составления: ${formattedDate}

ЗАКАЗЧИК: ${clientName}
ИСПОЛНИТЕЛЬ: ${workerName}

1. ОПИСАНИЕ ВЫПОЛНЕННЫХ РАБОТ

Наименование: ${shiftTitle}
Дата выполнения: ${new Date(shiftDate).toLocaleDateString('ru-RU')}
Продолжительность: ${shiftDuration}

2. СТОИМОСТЬ РАБОТ

Стоимость работ: ${payAmount.toLocaleString('ru-RU')} руб.

3. ЗАКЛЮЧЕНИЕ

Работы выполнены в полном объеме, в соответствии с договоренностями.
Заказчик претензий по объему и качеству не имеет.

Сформировано через платформу ШЕФ-МОНТАЖ
ID смены: ${shiftId}
  `.trim()

  // Save document to database
  const { data: doc, error } = await supabase
    .from('documents')
    .insert({
      shift_id: shiftId,
      client_id: clientId,
      worker_id: workerId,
      type: 'completion_act',
      document_number: actNumber,
      content: actContent,
      metadata: {
        shift_title: shiftTitle,
        shift_date: shiftDate,
        pay_amount: payAmount
      }
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving document:', error)
    throw new Error('Failed to save document')
  }

  return actContent
}

/**
 * Generate payment receipt
 */
export async function generatePaymentReceipt(paymentData: {
  paymentId: string
  shiftId: string
  clientId: string
  workerId: string
  amount: number
  platformFee: number
  workerPayout: number
  paidAt: string
}): Promise<string> {
  const {
    paymentId,
    shiftId,
    clientId,
    workerId,
    amount,
    platformFee,
    workerPayout,
    paidAt
  } = paymentData

  const receiptNumber = `RCP-${Date.now()}`
  const formattedDate = new Date(paidAt).toLocaleDateString('ru-RU')

  const receiptContent = `
ПЛАТЕЖНЫЙ ДОКУМЕНТ
№ ${receiptNumber}

Дата: ${formattedDate}

СУММА ПЛАТЕЖА: ${amount.toLocaleString('ru-RU')} руб.

Комиссия платформы: ${platformFee.toLocaleString('ru-RU')} руб.
Выплата исполнителю: ${workerPayout.toLocaleString('ru-RU')} руб.

ID платежа: ${paymentId}
ID смены: ${shiftId}

Сформировано платформой ШЕФ-МОНТАЖ
  `.trim()

  // Save document
  const { error } = await supabase
    .from('documents')
    .insert({
      shift_id: shiftId,
      client_id: clientId,
      worker_id: workerId,
      type: 'payment_receipt',
      document_number: receiptNumber,
      content: receiptContent,
      metadata: {
        payment_id: paymentId,
        amount,
        platform_fee: platformFee,
        worker_payout: workerPayout
      }
    })

  if (error) {
    console.error('Error saving receipt:', error)
    throw new Error('Failed to save receipt')
  }

  return receiptContent
}

/**
 * Get user's documents
 */
export async function getUserDocuments(userId: string) {
  const { data, error } = await supabase
    .from('documents')
    .select(`
      *,
      shift:shifts(title, date)
    `)
    .or(`client_id.eq.${userId},worker_id.eq.${userId}`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching documents:', error)
    return []
  }

  return data
}

/**
 * Get document by ID
 */
export async function getDocument(documentId: string) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single()

  if (error) {
    console.error('Error fetching document:', error)
    throw new Error('Document not found')
  }

  return data
}
