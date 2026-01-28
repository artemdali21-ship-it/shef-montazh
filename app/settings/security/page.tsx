'use client';
import { useState } from 'react';
import { ArrowLeft, Lock, Smartphone, Shield, Eye, EyeOff, 
         CheckCircle, AlertCircle, Key, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

const NoisePattern = () => (
  <svg
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      opacity: 0.03,
    }}
  >
    <defs>
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" seed="2" />
      </filter>
    </defs>
    <rect width="100%" height="100%" filter="url(#noise)" />
  </svg>
)

export default function SecuritySettings() {
  const router = useRouter();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const securityFeatures = [
    {
      icon: Smartphone,
      title: 'Двухфакторная аутентификация',
      description: '2FA через SMS или приложение',
      enabled: twoFactorEnabled,
      toggle: () => setTwoFactorEnabled(!twoFactorEnabled),
      recommended: true
    },
    {
      icon: Shield,
      title: 'Верификация через Госуслуги',
      description: 'Подтверждение личности',
      status: 'verified',
      link: '/settings/security/gosuslugi'
    },
    {
      icon: Eye,
      title: 'История входов',
      description: 'Последние 10 входов в аккаунт',
      link: '/settings/security/login-history'
    }
  ];

  const activeSessions = [
    {
      device: 'iPhone 14 Pro',
      location: 'Москва, Россия',
      ip: '192.168.1.1',
      lastActive: '2 минуты назад',
      current: true
    },
    {
      device: 'Chrome на Windows',
      location: 'Москва, Россия',
      ip: '192.168.1.2',
      lastActive: '3 дня назад',
      current: false
    }
  ];

  const handleChangePassword = () => {
    console.log('Changing password...');
  };

  return (
    <div
      style={{
      minHeight: '100vh',
      backgroundImage: 'url(/images/bg-dashboard.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      display: 'flex',
      flexDirection: 'column',
      }}
    >
      <NoisePattern />

      <div className="relative z-10 pb-24 flex flex-col h-full overflow-y-auto">
        {/* Header */}
        <header style={{
          position: 'sticky',
          top: 0,
          background: 'rgba(42, 42, 42, 0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: 20,
        }}>
          <div className="h-16 flex items-center justify-between px-4">
            <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-white font-montserrat font-700 text-xl">Безопасность</h1>
            <div className="w-10"></div>
          </div>
        </header>

        <div className="px-4 py-6 space-y-6">
          {/* Security Level */}
          <div className="bg-gradient-to-r from-[#BFFF00]/10 to-[#BFFF00]/5 border border-[#BFFF00]/30 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-[#BFFF00] rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="font-montserrat font-700 text-white text-lg">Средний уровень</h3>
                <p className="text-xs text-white font-montserrat font-500">
                  Можно улучшить безопасность
                </p>
              </div>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-3/5 bg-[#BFFF00]"></div>
            </div>
          </div>

          {/* Change Password */}
          <div>
            <h3 className="text-xs font-montserrat font-700 text-white uppercase tracking-wider mb-3 px-1">
              Смена пароля
            </h3>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-montserrat font-600 text-white mb-2">
                  Текущий пароль
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                    placeholder="Введите текущий пароль"
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-lg px-4 pr-12 text-white placeholder:text-[#6B6B6B] font-montserrat font-500 focus:outline-none focus:border-[#E85D2F]/50"
                  />
                  <button
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-5 h-5 text-white" />
                    ) : (
                      <Eye className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-montserrat font-600 text-white mb-2">
                  Новый пароль
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.new}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                    placeholder="Минимум 8 символов"
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-lg px-4 pr-12 text-white placeholder:text-[#6B6B6B] font-montserrat font-500 focus:outline-none focus:border-[#E85D2F]/50"
                  />
                  <button
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-5 h-5 text-white" />
                    ) : (
                      <Eye className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-montserrat font-600 text-white mb-2">
                  Повторите новый пароль
                </label>
                <input
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  placeholder="Повторите пароль"
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-lg px-4 text-white placeholder:text-[#6B6B6B] font-montserrat font-500 focus:outline-none focus:border-[#E85D2F]/50"
                />
              </div>

              <button
                onClick={handleChangePassword}
                className="w-full h-12 bg-[#E85D2F] hover:bg-[#D94D1F] rounded-lg font-montserrat font-700 text-white transition-colors"
              >
                Сменить пароль
              </button>
            </div>
          </div>

          {/* Security Features */}
          <div>
            <h3 className="text-xs font-montserrat font-700 text-white uppercase tracking-wider mb-3 px-1">
              Дополнительная защита
            </h3>
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              {securityFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className={`p-4 flex items-center justify-between ${
                      index !== securityFeatures.length - 1 ? 'border-b border-white/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#E85D2F]/10 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-[#E85D2F]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-montserrat font-600 text-white">{feature.title}</p>
                          {feature.recommended && (
                            <span className="text-xs bg-[#E85D2F] text-white px-3 py-2 rounded font-montserrat font-600">
                              Рекомендуется
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white font-montserrat font-500 mt-0.5">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                    {feature.toggle ? (
                      <button
                        onClick={feature.toggle}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          feature.enabled ? 'bg-[#BFFF00]' : 'bg-white/20'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            feature.enabled ? 'translate-x-6' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    ) : feature.status === 'verified' ? (
                      <CheckCircle className="w-5 h-5 text-[#BFFF00]" />
                    ) : (
                      <ArrowLeft className="w-5 h-5 text-white/30 rotate-180" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Sessions */}
          <div>
            <h3 className="text-xs font-montserrat font-700 text-white uppercase tracking-wider mb-3 px-1">
              Активные сессии
            </h3>
            <div className="space-y-3">
              {activeSessions.map((session, index) => (
                <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-montserrat font-600 text-white flex items-center gap-2">
                        {session.device}
                        {session.current && (
                          <span className="text-xs bg-[#E85D2F] text-white px-3 py-2 rounded font-montserrat font-600">
                            Текущее
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-white font-montserrat font-500 mt-1">
                        {session.location}
                      </p>
                    </div>
                    {!session.current && (
                      <button className="text-xs text-[#E85D2F] hover:text-[#D94D1F] font-montserrat font-600">
                        Выход
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-white font-montserrat font-500">
                    <span>IP: {session.ip}</span>
                    <span>Активно: {session.lastActive}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Logout All */}
          <button className="w-full h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg font-montserrat font-700 text-white flex items-center justify-center gap-2 transition-colors">
            <LogOut className="w-5 h-5" />
            Выход из всех устройств
          </button>
        </div>
      </div>
    </div>
  );
}
