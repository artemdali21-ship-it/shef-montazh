import { NextRequest, NextResponse } from 'next/server';
import { createServerClient as createClient } from '@/lib/supabase-server';
import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Проверяем, что пользователь админ
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Генерируем секрет
    const secret = new OTPAuth.Secret();
    const totp = new OTPAuth.TOTP({
      issuer: 'Шеф-Монтаж',
      label: user.email || 'Admin',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: secret,
    });

    // Генерируем QR-код
    const otpauthUrl = totp.toString();
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    // Сохраняем секрет (НЕ включаем 2FA сразу!)
    await supabase
      .from('users')
      .update({ two_factor_secret: secret.base32 })
      .eq('id', user.id);

    return NextResponse.json({
      secret: secret.base32,
      qrCode: qrCodeDataUrl,
      otpauthUrl,
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json({ error: 'Failed to setup 2FA' }, { status: 500 });
  }
}
