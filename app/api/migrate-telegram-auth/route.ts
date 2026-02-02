import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Migration endpoint to convert existing users to Telegram ID auth
 * This creates Supabase auth users for existing users with telegram_id
 */
export async function POST(request: NextRequest) {
  try {
    // Security: Only allow this in development or with admin auth
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.MIGRATION_SECRET || 'migrate-2024'

    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Use service role client for admin operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get all users with telegram_id
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, telegram_id, email, full_name')
      .not('telegram_id', 'is', null)

    if (usersError) {
      throw usersError
    }

    console.log(`[Migration] Found ${users.length} users with telegram_id`)

    const results = {
      total: users.length,
      migrated: 0,
      skipped: 0,
      errors: [] as any[]
    }

    const authSecret = process.env.NEXT_PUBLIC_TELEGRAM_AUTH_SECRET || 'secret'

    // Process each user
    for (const user of users) {
      try {
        const telegramEmail = `${user.telegram_id}@telegram.user`
        const telegramPassword = `tg_${user.telegram_id}_${authSecret}`

        // Check if auth user exists
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(user.id)

        if (authUser && !authError) {
          // Auth user exists - update their email to telegram pattern
          console.log(`[Migration] Updating auth email for user ${user.id}`)

          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            {
              email: telegramEmail,
              password: telegramPassword,
              email_confirm: true,
              user_metadata: {
                telegram_id: user.telegram_id,
                full_name: user.full_name
              }
            }
          )

          if (updateError) {
            console.error(`[Migration] Update error for ${user.id}:`, updateError)
            results.errors.push({ userId: user.id, error: updateError.message })
          } else {
            results.migrated++
          }
        } else {
          // Create new auth user
          console.log(`[Migration] Creating auth user for ${user.id}`)

          const { error: createError } = await supabaseAdmin.auth.admin.createUser({
            id: user.id,
            email: telegramEmail,
            password: telegramPassword,
            email_confirm: true,
            user_metadata: {
              telegram_id: user.telegram_id,
              full_name: user.full_name
            }
          })

          if (createError) {
            console.error(`[Migration] Create error for ${user.id}:`, createError)
            results.errors.push({ userId: user.id, error: createError.message })
          } else {
            results.migrated++
          }
        }
      } catch (error: any) {
        console.error(`[Migration] Error processing user ${user.id}:`, error)
        results.errors.push({ userId: user.id, error: error.message })
      }
    }

    console.log('[Migration] Complete:', results)

    return NextResponse.json({
      success: true,
      message: 'Migration completed',
      results
    })

  } catch (error: any) {
    console.error('[Migration] Fatal error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
