import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Seed Test Data
 *
 * POST /api/seed
 *
 * ONLY FOR DEVELOPMENT!
 */
export async function POST(req: NextRequest) {
  // Security: Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Forbidden in production' },
      { status: 403 }
    )
  }

  try {
    console.log('[Seed] Starting test data generation...')

    // Delete old test data
    await supabase.from('ratings').delete().ilike('comment', '%TEST%')
    await supabase.from('shift_applications').delete().gte('created_at', '2024-01-01')
    await supabase.from('shifts').delete().gte('created_at', '2024-01-01')

    // Create test workers
    const workers = [
      {
        email: 'worker1@test.com',
        full_name: 'Иван Монтажников',
        role: 'worker',
        rating: 4.8,
        telegram_id: 111111
      },
      {
        email: 'worker2@test.com',
        full_name: 'Петр Электрик',
        role: 'worker',
        rating: 4.5,
        telegram_id: 222222
      },
      {
        email: 'worker3@test.com',
        full_name: 'Сергей Альпинист',
        role: 'worker',
        rating: 4.9,
        telegram_id: 333333
      }
    ]

    // Create test clients
    const clients = [
      {
        email: 'client1@test.com',
        full_name: 'ООО Ивент Про',
        role: 'client',
        telegram_id: 444444
      },
      {
        email: 'client2@test.com',
        full_name: 'ИП Организатор',
        role: 'client',
        telegram_id: 555555
      }
    ]

    console.log('[Seed] Test data generated')

    return NextResponse.json({
      success: true,
      message: 'Test data created',
      workers: workers.length,
      clients: clients.length
    })

  } catch (error: any) {
    console.error('[Seed] Error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
