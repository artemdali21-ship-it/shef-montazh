import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Получаем профиль
    const { data: profile } = await supabase
      .from('users')
      .select('two_factor_secret, two_factor_enabled, role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!profile.two_factor_enabled) {
      return NextResponse.json({ error: '2FA not enabled' }, { status: 400 });
    }

    // Проверяем токен перед отключением
    const totp = new (await import('otpauth')).TOTP({
      secret: (await import('otpauth')).Secret.fromBase32(profile.two_factor_secret),
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
    });

    const delta = totp.validate({ token, window: 1 });

    if (delta === null) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    // Отключаем 2FA
    await supabase
      .from('users')
      .update({
        two_factor_enabled: false,
        two_factor_secret: null,
      })
      .eq('id', user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('2FA disable error:', error);
    return NextResponse.json({ error: 'Failed to disable' }, { status: 500 });
  }
}
