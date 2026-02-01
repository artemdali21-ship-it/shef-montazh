/**
 * Demo Data Seed Script
 *
 * Создает реалистичные демо-данные для preview режима:
 * - 3 демо-воркера (разные рейтинги и опыт)
 * - 2 демо-клиента
 * - 5 демо-смен (разные статусы)
 * - История откликов и завершенных работ
 *
 * Запуск: npx tsx scripts/seed-demo-data.ts
 */

import { createClient } from '@supabase/supabase-js'
import { addDays, subDays } from 'date-fns'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

// Demo User IDs (consistent UUIDs for demo data)
const DEMO_IDS = {
  worker1: '00000000-0000-0000-0000-000000000001',
  worker2: '00000000-0000-0000-0000-000000000002',
  worker3: '00000000-0000-0000-0000-000000000003',
  client1: '00000000-0000-0000-0000-000000000011',
  client2: '00000000-0000-0000-0000-000000000012',
}

async function seedDemoData() {
  console.log('🌱 Seeding demo data...')

  try {
    // 1. Create Demo Users
    console.log('Creating demo users...')
    await createDemoUsers()

    // 2. Create Worker Profiles
    console.log('Creating worker profiles...')
    await createWorkerProfiles()

    // 3. Create Client Profiles
    console.log('Creating client profiles...')
    await createClientProfiles()

    // 4. Create Demo Shifts
    console.log('Creating demo shifts...')
    await createDemoShifts()

    // 5. Create Applications & Work History
    console.log('Creating applications and work history...')
    await createWorkHistory()

    console.log('✅ Demo data seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding demo data:', error)
    throw error
  }
}

async function createDemoUsers() {
  const users = [
    {
      id: DEMO_IDS.worker1,
      telegram_id: 'demo_worker_1',
      username: 'ivan_montazhnik',
      first_name: 'Иван',
      last_name: 'Петров',
      phone: '+79991234567',
      role: 'worker',
      is_demo: true,
      is_verified: true,
      is_blocked: false,
      created_at: subDays(new Date(), 180).toISOString()
    },
    {
      id: DEMO_IDS.worker2,
      telegram_id: 'demo_worker_2',
      username: 'sergey_master',
      first_name: 'Сергей',
      last_name: 'Иванов',
      phone: '+79991234568',
      role: 'worker',
      is_demo: true,
      is_verified: true,
      is_blocked: false,
      created_at: subDays(new Date(), 90).toISOString()
    },
    {
      id: DEMO_IDS.worker3,
      telegram_id: 'demo_worker_3',
      username: 'alex_new',
      first_name: 'Александр',
      last_name: 'Новиков',
      phone: '+79991234569',
      role: 'worker',
      is_demo: true,
      is_verified: true,
      is_blocked: false,
      created_at: subDays(new Date(), 14).toISOString()
    },
    {
      id: DEMO_IDS.client1,
      telegram_id: 'demo_client_1',
      username: 'event_manager',
      first_name: 'Мария',
      last_name: 'Смирнова',
      phone: '+79991234570',
      role: 'client',
      is_demo: true,
      is_verified: true,
      is_blocked: false,
      created_at: subDays(new Date(), 120).toISOString()
    },
    {
      id: DEMO_IDS.client2,
      telegram_id: 'demo_client_2',
      username: 'expo_pro',
      first_name: 'Дмитрий',
      last_name: 'Козлов',
      phone: '+79991234571',
      role: 'client',
      is_demo: true,
      is_verified: true,
      is_blocked: false,
      created_at: subDays(new Date(), 60).toISOString()
    }
  ]

  for (const user of users) {
    await supabase.from('users').upsert(user)
  }
}

async function createWorkerProfiles() {
  const profiles = [
    {
      user_id: DEMO_IDS.worker1,
      skills: ['Монтаж конструкций', 'Электрика', 'Освещение'],
      experience_years: 5,
      trust_score: 92,
      completed_shifts: 47,
      rating: 4.8,
      total_ratings: 42,
      verification_status: 'approved',
      bio: 'Опытный монтажник. Работаю на выставках и концертах. Ответственный подход к делу.'
    },
    {
      user_id: DEMO_IDS.worker2,
      skills: ['Сцена', 'Звук', 'Свет'],
      experience_years: 3,
      trust_score: 78,
      completed_shifts: 23,
      rating: 4.5,
      total_ratings: 20,
      verification_status: 'approved',
      bio: 'Специализируюсь на сценических работах. Быстро и качественно.'
    },
    {
      user_id: DEMO_IDS.worker3,
      skills: ['Общий монтаж', 'Грузчик'],
      experience_years: 0,
      trust_score: 50,
      completed_shifts: 2,
      rating: 5.0,
      total_ratings: 2,
      verification_status: 'approved',
      bio: 'Начинающий монтажник. Готов учиться и работать.'
    }
  ]

  for (const profile of profiles) {
    await supabase.from('worker_profiles').upsert(profile)
  }
}

async function createClientProfiles() {
  const profiles = [
    {
      user_id: DEMO_IDS.client1,
      company_name: 'Event Masters',
      company_type: 'event_agency',
      trust_score: 85,
      total_shifts: 28,
      rating: 4.7,
      total_ratings: 25,
      verification_status: 'approved'
    },
    {
      user_id: DEMO_IDS.client2,
      company_name: 'Expo Solutions',
      company_type: 'production',
      trust_score: 72,
      total_shifts: 12,
      rating: 4.4,
      total_ratings: 10,
      verification_status: 'approved'
    }
  ]

  for (const profile of profiles) {
    await supabase.from('client_profiles').upsert(profile)
  }
}

async function createDemoShifts() {
  const shifts = [
    // 1. Open shift (можно откликнуться)
    {
      id: '00000000-0000-0000-0000-000000001001',
      client_id: DEMO_IDS.client1,
      title: 'Монтаж выставочного стенда',
      description: 'Требуется монтаж стенда 6x3м на выставке "Экспоцентр". Работа с металлоконструкциями.',
      location: 'Москва, Краснопресненская наб., 14',
      start_time: addDays(new Date(), 3).toISOString(),
      end_time: addDays(new Date(), 3).toISOString(),
      payment_amount: 3000,
      payment_type: 'pay_after',
      required_workers: 2,
      status: 'open',
      required_skills: ['Монтаж конструкций'],
      is_demo: true
    },
    // 2. In progress (воркер работает)
    {
      id: '00000000-0000-0000-0000-000000001002',
      client_id: DEMO_IDS.client2,
      title: 'Монтаж сцены для концерта',
      description: 'Сборка сцены 8x6м, установка светового оборудования. Опыт обязателен.',
      location: 'Москва, ул. Правды, 24',
      start_time: new Date().toISOString(),
      end_time: addDays(new Date(), 0).toISOString(),
      payment_amount: 5000,
      payment_type: 'pay_after',
      required_workers: 3,
      status: 'in_progress',
      required_skills: ['Сцена', 'Освещение'],
      approved_workers: [DEMO_IDS.worker1],
      is_demo: true
    },
    // 3. Completed (ждет оплаты)
    {
      id: '00000000-0000-0000-0000-000000001003',
      client_id: DEMO_IDS.client1,
      title: 'Демонтаж после мероприятия',
      description: 'Разборка конструкций, упаковка оборудования. Вывоз мусора.',
      location: 'Москва, ВДНХ, павильон 75',
      start_time: subDays(new Date(), 1).toISOString(),
      end_time: subDays(new Date(), 1).toISOString(),
      payment_amount: 2500,
      payment_type: 'pay_after',
      required_workers: 2,
      status: 'completed',
      required_skills: ['Общий монтаж'],
      approved_workers: [DEMO_IDS.worker2, DEMO_IDS.worker3],
      is_demo: true
    },
    // 4. Cancelled shift
    {
      id: '00000000-0000-0000-0000-000000001004',
      client_id: DEMO_IDS.client2,
      title: 'Установка выставочного оборудования',
      description: 'Мероприятие отменено организаторами.',
      location: 'Москва, ЦВК "Экспоцентр"',
      start_time: addDays(new Date(), 7).toISOString(),
      end_time: addDays(new Date(), 7).toISOString(),
      payment_amount: 3500,
      payment_type: 'pay_after',
      required_workers: 2,
      status: 'cancelled',
      required_skills: ['Монтаж конструкций'],
      cancellation_reason: 'Мероприятие отменено организаторами',
      is_demo: true
    },
    // 5. Completed and paid (полная история)
    {
      id: '00000000-0000-0000-0000-000000001005',
      client_id: DEMO_IDS.client1,
      title: 'Монтаж освещения',
      description: 'Установка световых приборов для корпоратива.',
      location: 'Москва, Тверская ул., 15',
      start_time: subDays(new Date(), 5).toISOString(),
      end_time: subDays(new Date(), 5).toISOString(),
      payment_amount: 4000,
      payment_type: 'pay_after',
      payment_status: 'completed',
      required_workers: 1,
      status: 'completed',
      required_skills: ['Освещение', 'Электрика'],
      approved_workers: [DEMO_IDS.worker1],
      is_demo: true
    }
  ]

  for (const shift of shifts) {
    await supabase.from('shifts').upsert(shift)
  }
}

async function createWorkHistory() {
  // Applications for open shift
  const applications = [
    {
      shift_id: '00000000-0000-0000-0000-000000001001',
      worker_id: DEMO_IDS.worker1,
      status: 'pending',
      created_at: subDays(new Date(), 1).toISOString()
    },
    {
      shift_id: '00000000-0000-0000-0000-000000001001',
      worker_id: DEMO_IDS.worker2,
      status: 'pending',
      created_at: new Date().toISOString()
    }
  ]

  for (const app of applications) {
    await supabase.from('shift_applications').upsert(app)
  }

  // Check-ins for in-progress shift
  const checkins = [
    {
      shift_id: '00000000-0000-0000-0000-000000001002',
      worker_id: DEMO_IDS.worker1,
      check_in_time: new Date().toISOString(),
      check_in_location: { lat: 55.7558, lng: 37.6173 },
      status: 'checked_in'
    }
  ]

  for (const checkin of checkins) {
    await supabase.from('shift_check_ins').upsert(checkin)
  }

  // Ratings for completed shifts
  const ratings = [
    {
      shift_id: '00000000-0000-0000-0000-000000001005',
      rated_user_id: DEMO_IDS.worker1,
      rater_user_id: DEMO_IDS.client1,
      rating: 5,
      comment: 'Отличная работа! Все сделано быстро и качественно.',
      created_at: subDays(new Date(), 4).toISOString()
    },
    {
      shift_id: '00000000-0000-0000-0000-000000001005',
      rated_user_id: DEMO_IDS.client1,
      rater_user_id: DEMO_IDS.worker1,
      rating: 5,
      comment: 'Адекватный заказчик, все четко.',
      created_at: subDays(new Date(), 4).toISOString()
    }
  ]

  for (const rating of ratings) {
    await supabase.from('ratings').upsert(rating)
  }
}

// Run seed
seedDemoData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
