import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'
const START_TIME = Date.now()

interface HealthCheck {
  name: string
  status: 'ok' | 'error'
  responseTime?: number
  error?: string
}

/**
 * Health Check Endpoint
 *
 * Проверяет живость сервиса и всех критических зависимостей:
 * - Database (Supabase)
 * - Storage (Supabase Storage)
 * - Environment variables
 *
 * Используется:
 * - Vercel monitoring
 * - Uptime monitors (UptimeRobot, Pingdom)
 * - Internal debugging
 */
export async function GET() {
  const startTime = Date.now()
  const checks: HealthCheck[] = []

  // 1. Database Check
  const dbCheck = await checkDatabase()
  checks.push(dbCheck)

  // 2. Storage Check
  const storageCheck = await checkStorage()
  checks.push(storageCheck)

  // 3. Environment Check
  const envCheck = checkEnvironment()
  checks.push(envCheck)

  // Calculate overall status
  const allOk = checks.every(check => check.status === 'ok')
  const status = allOk ? 'ok' : 'error'

  // Calculate uptime
  const uptime = Math.floor((Date.now() - START_TIME) / 1000) // seconds

  const response = {
    status,
    version: APP_VERSION,
    timestamp: new Date().toISOString(),
    uptime, // seconds since process start
    responseTime: Date.now() - startTime, // ms
    checks: checks.reduce((acc, check) => {
      acc[check.name] = {
        status: check.status,
        responseTime: check.responseTime,
        error: check.error
      }
      return acc
    }, {} as Record<string, Omit<HealthCheck, 'name'>>)
  }

  // Return 503 if any check failed (for monitoring tools)
  const statusCode = allOk ? 200 : 503

  return NextResponse.json(response, { status: statusCode })
}

/**
 * Check Database Connection
 * Tries to query users table
 */
async function checkDatabase(): Promise<HealthCheck> {
  const start = Date.now()

  try {
    const supabase = await createClient()

    // Simple query to test connection
    const { error } = await supabase
      .from('users')
      .select('id')
      .limit(1)
      .single()

    // Note: .single() might error if no users exist, but that's ok
    // We only care about connection errors
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }

    return {
      name: 'database',
      status: 'ok',
      responseTime: Date.now() - start
    }
  } catch (error) {
    return {
      name: 'database',
      status: 'error',
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Check Storage Connection
 * Lists buckets to verify storage access
 */
async function checkStorage(): Promise<HealthCheck> {
  const start = Date.now()

  try {
    const supabase = await createClient()

    // Try to list buckets
    const { data, error } = await supabase
      .storage
      .listBuckets()

    if (error) {
      throw error
    }

    // Check that documents bucket exists
    const hasBucket = data?.some(bucket => bucket.name === 'documents')

    if (!hasBucket) {
      throw new Error('Documents bucket not found')
    }

    return {
      name: 'storage',
      status: 'ok',
      responseTime: Date.now() - start
    }
  } catch (error) {
    return {
      name: 'storage',
      status: 'error',
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Check Environment Variables
 * Verifies all critical env vars are set
 */
function checkEnvironment(): HealthCheck {
  const start = Date.now()

  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'TELEGRAM_BOT_TOKEN'
  ]

  const missing = requiredVars.filter(varName => !process.env[varName])

  if (missing.length > 0) {
    return {
      name: 'environment',
      status: 'error',
      responseTime: Date.now() - start,
      error: `Missing env vars: ${missing.join(', ')}`
    }
  }

  return {
    name: 'environment',
    status: 'ok',
    responseTime: Date.now() - start
  }
}
