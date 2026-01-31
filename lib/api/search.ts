import { createClient } from '@/lib/supabase-client'

export interface ShiftSearchFilters {
  categories?: string[]
  date?: string
  district?: string
  priceMin?: number
  priceMax?: number
  minRating?: number
  sortBy?: 'date' | 'price' | 'rating'
  page?: number
}

export interface ShiftSearchResult {
  id: string
  title: string
  category: string
  date: string
  start_time: string
  end_time: string
  location_address: string
  pay_amount: number
  status: string
  client_id: string
  client_name: string
  client_rating: number
  description: string | null
  required_workers: number | null
  created_at: string
}

const ITEMS_PER_PAGE = 20

export async function searchShifts(filters: ShiftSearchFilters) {
  const supabase = createClient()
  const page = filters.page || 1
  const offset = (page - 1) * ITEMS_PER_PAGE

  try {
    // Build query
    let query = supabase
      .from('shifts')
      .select(`
        id,
        title,
        category,
        date,
        start_time,
        end_time,
        location_address,
        pay_amount,
        status,
        client_id,
        description,
        required_workers,
        created_at,
        users!client_id (
          full_name,
          rating
        )
      `, { count: 'exact' })
      .eq('status', 'open')

    // Apply filters
    if (filters.categories && filters.categories.length > 0) {
      query = query.in('category', filters.categories)
    }

    if (filters.date) {
      query = query.eq('date', filters.date)
    }

    if (filters.district) {
      query = query.ilike('location_address', `%${filters.district}%`)
    }

    if (filters.priceMin !== undefined) {
      query = query.gte('pay_amount', filters.priceMin)
    }

    if (filters.priceMax !== undefined) {
      query = query.lte('pay_amount', filters.priceMax)
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price':
        query = query.order('pay_amount', { ascending: false })
        break
      case 'rating':
        // Sort by client rating (joined table)
        query = query.order('users(rating)', { ascending: false })
        break
      case 'date':
      default:
        query = query.order('date', { ascending: true })
        break
    }

    // Apply pagination
    query = query.range(offset, offset + ITEMS_PER_PAGE - 1)

    const { data, error, count } = await query

    if (error) throw error

    // Transform data
    const shifts: ShiftSearchResult[] = (data || []).map((shift: any) => ({
      id: shift.id,
      title: shift.title,
      category: shift.category,
      date: shift.date,
      start_time: shift.start_time,
      end_time: shift.end_time,
      location_address: shift.location_address,
      pay_amount: shift.pay_amount,
      status: shift.status,
      client_id: shift.client_id,
      client_name: shift.users?.full_name || 'Неизвестно',
      client_rating: shift.users?.rating || 0,
      description: shift.description,
      required_workers: shift.required_workers,
      created_at: shift.created_at,
    }))

    // Filter by client rating if specified
    let filteredShifts = shifts
    if (filters.minRating !== undefined && filters.minRating > 0) {
      filteredShifts = shifts.filter(shift => shift.client_rating >= filters.minRating!)
    }

    return {
      data: filteredShifts,
      count: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE),
      error: null,
    }
  } catch (err) {
    console.error('Error searching shifts:', err)
    return {
      data: [],
      count: 0,
      page: 1,
      totalPages: 0,
      error: err as Error,
    }
  }
}

export const DISTRICTS = [
  'Центр',
  'Север',
  'Юг',
  'Восток',
  'Запад',
  'ЗАО',
  'САО',
  'СВАО',
  'ВАО',
  'ЮВАО',
  'ЮАО',
  'ЮЗАО',
  'СЗАО',
]

export const CATEGORIES = [
  { id: 'montazhnik', name: 'Монтажник' },
  { id: 'decorator', name: 'Декоратор' },
  { id: 'electrik', name: 'Электрик' },
  { id: 'svarchik', name: 'Сварщик' },
  { id: 'alpinist', name: 'Альпинист' },
  { id: 'butafor', name: 'Бутафор' },
  { id: 'raznorabochiy', name: 'Разнорабочий' },
]
