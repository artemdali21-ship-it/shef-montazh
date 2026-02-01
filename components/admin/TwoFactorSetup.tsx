'use client'

import { useState, useEffect } from 'react'
import { Shield, Check, X, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase-client'

export default function TwoFactorSetup() {
  const [step, setStep] = useState<'idle' | 'setup' | 'verify'>('idle')
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isEnabled, setIsEnabled] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)
  const [disableToken, setDisableToken] = useState('')

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('two_factor_enabled')
          .eq('id', user.id)
          .single()

        setIsEnabled(profile?.two_factor_enabled || false)
      }
    } catch (err) {
      console.error('Check 2FA status error:', err)
    } finally {
      setCheckingStatus(false)
    }
  }

  const handleSetup = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/2fa/setup', { method: 'POST' })
      if (!res.ok) throw new Error('Setup failed')

      const data = await res.json()
      setQrCode(data.qrCode)
      setSecret(data.secret)
      setStep('verify')
    } catch (err) {
      setError('Не удалось настроить 2FA')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      if (!res.ok) throw new Error('Verification failed')

      alert('2FA успешно включена!')
      window.location.reload()
    } catch (err) {
      setError('Неверный код. Попробуйте снова.')
    } finally {
      setLoading(false)
    }
  }

  const handleDisable = async () => {
    if (!disableToken || disableToken.length !== 6) {
      setError('Введите код для отключения')
      return
    }

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: disableToken }),
      })

      if (!res.ok) throw new Error('Disable failed')

      alert('2FA отключена')
      window.location.reload()
    } catch (err) {
      setError('Неверный код. Попробуйте снова.')
    } finally {
      setLoading(false)
    }
  }

  if (checkingStatus) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-center gap-3 py-8">
          <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
          <span className="text-gray-400">Загрузка...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Shield className="w-6 h-6 text-orange-500" />
        <h3 className="text-lg font-semibold text-white">Двухфакторная аутентификация</h3>
      </div>

      {/* Already enabled state */}
      {isEnabled && step === 'idle' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <Check className="w-5 h-5" />
            <span className="font-medium">2FA включена</span>
          </div>
          <p className="text-sm text-gray-400">
            Ваш аккаунт защищен двухфакторной аутентификацией.
          </p>

          <div className="pt-4 border-t border-white/10">
            <p className="text-sm text-gray-400 mb-3">
              Для отключения введите текущий код:
            </p>
            <input
              type="text"
              placeholder="000000"
              value={disableToken}
              onChange={(e) => setDisableToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-center text-2xl tracking-widest focus:outline-none focus:border-orange-500/50 transition"
            />
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-400 mt-2">
                <X className="w-4 h-4" />
                {error}
              </div>
            )}
            <button
              onClick={handleDisable}
              disabled={loading || disableToken.length !== 6}
              className="w-full mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Отключение...' : 'Отключить 2FA'}
            </button>
          </div>
        </div>
      )}

      {/* Not enabled - setup flow */}
      {!isEnabled && step === 'idle' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Защитите свой аккаунт с помощью одноразовых кодов из приложения
            (Google Authenticator, Authy и др.)
          </p>
          <button
            onClick={handleSetup}
            disabled={loading}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Настройка...' : 'Настроить 2FA'}
          </button>
        </div>
      )}

      {step === 'verify' && qrCode && (
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Отсканируйте QR-код в приложении для аутентификации:
          </p>
          <div className="flex justify-center">
            <Image src={qrCode} alt="QR Code" width={200} height={200} />
          </div>
          <div className="text-xs text-gray-500">
            <p className="text-gray-400">Или введите ключ вручную:</p>
            <code className="block mt-1 p-2 bg-white/10 rounded text-gray-300 font-mono">
              {secret}
            </code>
          </div>

          <div className="pt-4 border-t border-white/10">
            <p className="text-sm text-gray-400 mb-3">
              Введите 6-значный код из приложения:
            </p>
            <input
              type="text"
              placeholder="000000"
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-center text-2xl tracking-widest focus:outline-none focus:border-orange-500/50 transition"
            />
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-400 mt-2">
                <X className="w-4 h-4" />
                {error}
              </div>
            )}
            <button
              onClick={handleVerify}
              disabled={loading || token.length !== 6}
              className="w-full mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Проверка...' : 'Подтвердить и включить 2FA'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
