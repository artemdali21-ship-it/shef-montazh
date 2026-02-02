export type UserRole = 'worker' | 'client' | 'shef'

export type Session = {
  userId: string
  telegramId: number
  role: UserRole
  hasSeenOnboarding: boolean
  expiresAt: number // Unix timestamp
}

export type SessionStorageKey = 'shef-montazh-session'

export type UserByTelegramResponse = {
  exists: boolean
  id?: string
  role?: UserRole
  hasSeenOnboarding?: boolean
  telegramId?: number
}

export type RegisterResponse = {
  success: boolean
  user?: {
    id: string
    telegram_id: number
    role: UserRole
    has_completed_onboarding: boolean
  }
  error?: string
}

export type CompleteOnboardingResponse = {
  success: boolean
  error?: string
}

export type SwitchRoleResponse = {
  success: boolean
  error?: string
}

export type LogoutResponse = {
  success: boolean
  error?: string
}
