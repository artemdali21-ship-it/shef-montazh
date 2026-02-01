import { createClient } from '@/lib/supabase-client'

export interface WorkerSearchFilters {
  categories?: string[]
  minRating?: number
  minExperience?: number
  district?: string
  verifiedOnly?: boolean
  favoritesOnly?: boolean
  sortBy?: 'rating' | 'experience' | 'price' | 'alphabetical'
  page?: number
}

export interface WorkerSearchResult {
  id: string
  full_name: string
  rating: number
  avatar_url: string | null
  phone: string
  is_verified: boolean
  gosuslugi_verified: boolean
  successful_shifts: number
  total_shifts: number
  categories: string[]
  bio: string | null
  experience_years: number | null
  tools_available: string[] | null
  price_per_shift: number | null
  created_at: string
}

const ITEMS_PER_PAGE = 20

export async function searchWorkers(filters: WorkerSearchFilters, clientId?: string) {
  const supabase = await createClient()
  const page = filters.page || 1
  const offset = (page - 1) * ITEMS_PER_PAGE

  try {
    // Build query
    let query = supabase
      .from('users')
      .select(`
        id,
        full_name,
        rating,
        avatar_url,
        phone,
        is_verified,
        gosuslugi_verified,
        successful_shifts,
        total_shifts,
        created_at,
        worker_profiles!inner (
          categories,
          bio,
          experience_years,
          tools_available,
          status
        )
      `, { count: 'exact' })
      .eq('role', 'worker')
      .eq('worker_profiles.status', 'active')

    // Apply filters
    if (filters.categories && filters.categories.length > 0) {
      // Use overlaps to find workers with ANY of the selected categories
      query = query.overlaps('worker_profiles.categories', filters.categories)
    }

    if (filters.minRating !== undefined && filters.minRating > 0) {
      query = query.gte('rating', filters.minRating)
    }

    if (filters.minExperience !== undefined && filters.minExperience > 0) {
      query = query.gte('worker_profiles.experience_years', filters.minExperience)
    }

    if (filters.verifiedOnly) {
      query = query.eq('gosuslugi_verified', true)
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'rating':
        query = query.order('rating', { ascending: false })
        break
      case 'experience':
        query = query.order('worker_profiles(experience_years)', { ascending: false })
        break
      case 'price':
        // Sort by experience as proxy for price (more experienced = higher price)
        query = query.order('worker_profiles(experience_years)', { ascending: false })
        break
      case 'alphabetical':
        query = query.order('full_name', { ascending: true })
        break
      default:
        query = query.order('rating', { ascending: false })
        break
    }

    // Apply pagination
    query = query.range(offset, offset + ITEMS_PER_PAGE - 1)

    const { data, error, count } = await query

    if (error) throw error

    // Transform data
    let workers: WorkerSearchResult[] = (data || []).map((user: any) => {
      // Calculate price based on experience (base 5000₽ + 500₽ per year)
      const experience = user.worker_profiles?.experience_years || 0
      const basePrice = 5000
      const experienceBonus = experience * 500
      const price_per_shift = basePrice + experienceBonus

      return {
        id: user.id,
        full_name: user.full_name,
        rating: user.rating || 0,
        avatar_url: user.avatar_url,
        phone: user.phone,
        is_verified: user.is_verified || false,
        gosuslugi_verified: user.gosuslugi_verified || false,
        successful_shifts: user.successful_shifts || 0,
        total_shifts: user.total_shifts || 0,
        categories: user.worker_profiles?.categories || [],
        bio: user.worker_profiles?.bio,
        experience_years: user.worker_profiles?.experience_years,
        tools_available: user.worker_profiles?.tools_available,
        price_per_shift,
        created_at: user.created_at,
      }
    })

    // Filter by favorites if requested
    if (filters.favoritesOnly && clientId) {
      const { data: favorites } = await supabase
        .from('favorites')
        .select('favorite_user_id')
        .eq('user_id', clientId)

      const favoriteIds = new Set(favorites?.map(f => f.favorite_user_id) || [])
      workers = workers.filter(w => favoriteIds.has(w.id))
    }

    // Filter by district (search in recent shifts)
    if (filters.district) {
      // This is a simplified version - in production you'd want to track worker locations
      // For now, we just return all workers
    }

    return {
      data: workers,
      count: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE),
      error: null,
    }
  } catch (err) {
    console.error('Error searching workers:', err)
    return {
      data: [],
      count: 0,
      page: 1,
      totalPages: 0,
      error: err as Error,
    }
  }
}

export const EXPERIENCE_LEVELS = [
  { value: 0, label: 'Любой' },
  { value: 1, label: 'От 1 года' },
  { value: 3, label: 'От 3 лет' },
  { value: 5, label: 'От 5 лет' },
  { value: 10, label: 'От 10 лет' },
]
