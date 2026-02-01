import { z } from 'zod';

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(), // Optional in some contexts

  // Telegram
  TELEGRAM_BOT_TOKEN: z.string().regex(/^\d+:[A-Za-z0-9_-]+$/).optional(),
  NEXT_PUBLIC_TELEGRAM_BOT_USERNAME: z.string().min(1).optional(),

  // ЮКасса (опционально в dev)
  YUKASSA_SHOP_ID: z.string().optional(),
  YUKASSA_SECRET_KEY: z.string().optional(),

  // Upstash Redis (опционально)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),

  // Sentry (опционально)
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_DSN: z.string().url().optional(),

  // Vercel (автоматически)
  VERCEL_URL: z.string().optional(),
  VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional(),

  // Node environment
  NODE_ENV: z.enum(['development', 'test', 'production']).optional(),
});

export function validateEnv() {
  try {
    envSchema.parse(process.env);
    console.log('✅ Environment variables validated successfully');
    return true;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });

      // In production, exit the process
      if (process.env.NODE_ENV === 'production') {
        console.error('\n🚨 Cannot start application with invalid environment variables');
        process.exit(1);
      } else {
        console.warn('\n⚠️  Running with invalid environment variables (development mode)');
      }
      return false;
    }
    throw error;
  }
}

// Типизированный доступ к env
export const env = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    botUsername: process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME,
  },
  yukassa: {
    shopId: process.env.YUKASSA_SHOP_ID,
    secretKey: process.env.YUKASSA_SECRET_KEY,
  },
  upstash: {
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  },
  sentry: {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
  },
  vercel: {
    url: process.env.VERCEL_URL,
    env: process.env.VERCEL_ENV,
  },
  nodeEnv: process.env.NODE_ENV,
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
};

// Helper to check if required services are configured
export const hasService = {
  telegram: !!env.telegram.botToken,
  yukassa: !!env.yukassa.shopId && !!env.yukassa.secretKey,
  redis: !!env.upstash.url && !!env.upstash.token,
  sentry: !!env.sentry.dsn,
};
