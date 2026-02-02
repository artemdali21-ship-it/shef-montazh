import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import type { CompleteOnboardingResponse } from '@/types/session'

export async function PATCH(request: NextRequest) {
  try {
    const { telegramId } = await request.json()

    if (!telegramId) {
      return NextResponse.json<CompleteOnboardingResponse>(
        { success: false, error: 'Telegram ID is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Update user onboarding status
    const { error } = await supabase
      .from('users')
      .update({
        has_completed_onboarding: true,
        profile_completed: true,
      })
      .eq('telegram_id', telegramId)

    if (error) {
      console.error('[API] Error completing onboarding:', error)
      return NextResponse.json<CompleteOnboardingResponse>(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json<CompleteOnboardingResponse>({
      success: true,
    })
  } catch (error) {
    console.error('[API] Error in complete-onboarding:', error)
    return NextResponse.json<CompleteOnboardingResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
