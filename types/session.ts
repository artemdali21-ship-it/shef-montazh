export type UserRole = 'worker' | 'client' | 'shef'

export type Session = {
  userId: string
  telegramId: number
  role: UserRole
  roles: UserRole[] // All available roles
  hasSeenOnboarding: boolean
  expiresAt: number // Unix timestamp
}

export type SessionStorageKey = 'shef-montazh-session'

export type UserByTelegramResponse = {
  exists: boolean
  id?: string
  role?: UserRole
  roles?: UserRole[] // All available roles
  hasSeenOnboarding?: boolean
  telegramId?: number
}

export type RegisterResponse = {
  success: boolean
  user?: {
    id: string
    telegram_id: number
    role: UserRole
    roles?: UserRole[] // All available roles
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
  multipleRoles?: boolean // Whether user has multiple roles
  error?: string
}
