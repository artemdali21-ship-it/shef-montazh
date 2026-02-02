import { z } from 'zod'

// Shift validation
export const shiftSchema = z.object({
  title: z.string().min(5, 'Название должно быть не менее 5 символов'),
  category: z.string().min(1, 'Выберите категорию'),
  location_address: z.string().min(5, 'Укажите адрес'),
  date: z.string().refine((date) => new Date(date) >= new Date(), {
    message: 'Дата должна быть в будущем'
  }),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Неверный формат времени'),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Неверный формат времени'),
  pay_amount: z.number().min(1000, 'Минимальная оплата 1000₽'),
  required_workers: z.number().min(1).max(50),
})

// Application validation
export const applicationSchema = z.object({
  shift_id: z.string().uuid(),
  message: z.string().max(500, 'Сообщение не должно превышать 500 символов').optional(),
})

// Rating validation
export const ratingSchema = z.object({
  shift_id: z.string().uuid(),
  rated_user_id: z.string().uuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().max(500).optional(),
})

// Payment validation
export const paymentSchema = z.object({
  shift_id: z.string().uuid(),
  amount: z.number().min(0),
})

// User validation
export const emailSchema = z.string().email('Неверный формат email')
export const phoneSchema = z.string().regex(/^\+?[0-9]{10,15}$/, 'Неверный формат телефона')

// XSS protection
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}
