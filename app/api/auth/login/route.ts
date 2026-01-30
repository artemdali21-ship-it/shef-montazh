import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { phone, password } = await request.json()

    if (!phone || !password) {
      return NextResponse.json(
        { message: 'Номер телефона и пароль обязательны' },
        { status: 400 }
      )
    }

    // Mock authentication - for testing with demo credentials
    // In production, this would verify against actual database/auth system
    const validPhones: { [key: string]: string } = {
      '+79001234567': 'password123',
      '+79009876543': 'demo123',
    }

    const storedPassword = validPhones[phone]

    if (!storedPassword) {
      // User not found
      return NextResponse.json(
        { message: 'Пользователь не найден' },
        { status: 404 }
      )
    }

    if (password !== storedPassword) {
      // Wrong password
      return NextResponse.json(
        { message: 'Неверный пароль' },
        { status: 401 }
      )
    }

    // Success - return user data
    return NextResponse.json(
      {
        success: true,
        user: {
          id: phone,
          phone,
          role: 'worker',
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Login API error:', error)
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
