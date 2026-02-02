import { NextRequest, NextResponse } from 'next/server';
import { createServerClient as createClient } from '@/lib/supabase-server';
import * as OTPAuth from 'otpauth';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Получаем секрет
    const { data: profile } = await supabase
      .from('users')
      .select('two_factor_secret, role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!profile.two_factor_secret) {
      return NextResponse.json({ error: '2FA not setup' }, { status: 400 });
    }

    // Создаем TOTP объект
    const totp = new OTPAuth.TOTP({
      secret: OTPAuth.Secret.fromBase32(profile.two_factor_secret),
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
    });

    // Проверяем токен (с окном ±1 период для синхронизации времени)
    const delta = totp.validate({ token, window: 1 });

    if (delta === null) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    // Включаем 2FA
    await supabase
      .from('users')
      .update({ two_factor_enabled: true })
      .eq('id', user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('2FA verify error:', error);
    return NextResponse.json({ error: 'Failed to verify' }, { status: 500 });
  }
}
