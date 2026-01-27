'use client';
import { useState, useRef } from 'react';
import React from "react"
import { ArrowLeft, Camera, Trash2, Save, User, Mail, Phone, MapPin, Briefcase, Award, ExternalLink, Check, Wrench, Palette, Mountain, Zap, Flame, Hammer, Box } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { NoisePattern } from '@/components/noise-pattern';

export default function EditProfile() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profileData, setProfileData] = useState({
    avatar: null as string | null,
    fullName: 'Артём Иванов',
    email: 'artem@example.com',
    phone: '+7 (900) 123-45-67',
    bio: 'Опытный монтажник с 5+ летним стажем. Специализируюсь на выставочных стендах и декорациях.',
    city: 'Москва',
    specializations: ['montazhnik', 'dekorator'],
    experience: '3-5',
    hasTools: true,
    hourlyRate: 500,
    telegram: '@artem_montazh',
    portfolio: 'https://behance.net/artem'
  });

  const [hasChanges, setHasChanges] = useState(false);

  const specializations = [
    { id: 'montazhnik', label: 'Монтажник', icon: '/images/specializations/key.png' },
    { id: 'dekorator', label: 'Декоратор', icon: '/images/specializations/palette.png' },
    { id: 'alpinist', label: 'Альпинист', icon: '/images/specializations/climber.png' },
    { id: 'electrician', label: 'Электрик', icon: '/images/specializations/lightning.png' },
    { id: 'svarshik', label: 'Сварщик', icon: '/images/specializations/flame.png' },
    { id: 'plotnik', label: 'Плотник', icon: '/images/specializations/saw.png' },
    { id: 'malyar', label: 'Маляр', icon: '/images/specializations/brush.png' },
    { id: 'gruzchik', label: 'Грузчик', icon: '/images/specializations/box.png' }
  ];

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, avatar: reader.result as string });
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setProfileData({ ...profileData, avatar: null });
    setHasChanges(true);
  };

  const toggleSpecialization = (id: string) => {
    const newSpecs = profileData.specializations.includes(id)
      ? profileData.specializations.filter(s => s !== id)
      : [...profileData.specializations, id];
    setProfileData({ ...profileData, specializations: newSpecs });
    setHasChanges(true);
  };

  const handleSave = async () => {
    console.log('Saving profile...', profileData);
    setHasChanges(false);
    router.back();
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: 'url(/images/bg-dashboard.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      position: 'relative',
      overflow: 'hidden',
      paddingBottom: 96,
    }}>
      <NoisePattern />

      {/* 3D Concrete Objects */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '5%',
        opacity: 0.15,
        pointerEvents: 'none',
        zIndex: 1,
      }}>
        <div style={{
          width: 120,
          height: 120,
          background: 'linear-gradient(135deg, #4A4A4A 0%, #2A2A2A 100%)',
          borderRadius: 12,
          transform: 'rotate(25deg)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        }} />
      </div>
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '8%',
        opacity: 0.12,
        pointerEvents: 'none',
        zIndex: 1,
      }}>
        <div style={{
          width: 100,
          height: 100,
          background: 'linear-gradient(135deg, #5A5A5A 0%, #3A3A3A 100%)',
          borderRadius: 8,
          transform: 'rotate(-20deg)',
          boxShadow: '0 15px 30px rgba(0,0,0,0.4)',
        }} />
      </div>

      <div className="relative z-10">
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
            <h1 className="text-white font-montserrat font-700 text-xl">Редактировать профиль</h1>
            <button 
              onClick={handleSave}
              disabled={!hasChanges}
              className={`w-10 h-10 flex items-center justify-center ${
                hasChanges ? 'text-[#E85D2F]' : 'text-[#6B6B6B]'
              }`}
            >
              <Save className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="px-4 py-6 space-y-6">
          {/* Avatar Section */}
          <div>
            <h3 className="text-xs font-montserrat font-700 text-white uppercase tracking-wider mb-3 px-1">
              Фото профиля
            </h3>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#E85D2F] to-[#D94D1F] rounded-full flex items-center justify-center overflow-hidden">
                    {profileData.avatar ? (
                      <img src={profileData.avatar || "/placeholder.svg"} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-montserrat font-800 text-white">
                        {profileData.fullName.split(' ').map(n => n[0]).join('')}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-9 h-9 bg-[#BFFF00] rounded-full flex items-center justify-center border-2 border-[#2A2A2A]"
                  >
                    <Camera className="w-4 h-4 text-black" />
                  </button>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleAvatarChange}
                  />
                </div>
                <div className="flex-1">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg font-montserrat font-600 text-white text-sm mb-2 transition-colors"
                  >
                    Загрузить фото
                  </button>
                  {profileData.avatar && (
                    <button
                      onClick={handleRemoveAvatar}
                      className="w-full h-10 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg font-montserrat font-600 text-red-500 text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Удалить фото
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div>
            <h3 className="text-xs font-montserrat font-700 text-white uppercase tracking-wider mb-3 px-1">
              Основная информация
            </h3>
            <div className="space-y-3">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-montserrat font-600 text-white mb-2 px-1">
                  Полное имя
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C0C0C0]" />
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => {
                      setProfileData({ ...profileData, fullName: e.target.value });
                      setHasChanges(true);
                    }}
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-white font-montserrat font-500 focus:outline-none focus:border-[#E85D2F]/50"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-montserrat font-600 text-white mb-2 px-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C0C0C0]" />
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => {
                      setProfileData({ ...profileData, email: e.target.value });
                      setHasChanges(true);
                    }}
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-white font-montserrat font-500 focus:outline-none focus:border-[#E85D2F]/50"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-montserrat font-600 text-white mb-2 px-1">
                  Телефон
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C0C0C0]" />
                  <input
                    type="tel"
                    value={profileData.phone}
                    disabled
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-white/60 font-montserrat font-500 cursor-not-allowed"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <Check className="w-4 h-4 text-[#BFFF00]" />
                    <span className="text-xs text-[#BFFF00] font-montserrat font-700">Подтверждён</span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-montserrat font-600 text-white mb-2 px-1">
                  О себе
                </label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => {
                    setProfileData({ ...profileData, bio: e.target.value });
                    setHasChanges(true);
                  }}
                  rows={4}
                  maxLength={200}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-montserrat font-500 resize-none focus:outline-none focus:border-[#E85D2F]/50"
                  placeholder="Расскажите о вашем опыте и навыках..."
                />
                <p className="text-xs text-white/60 font-montserrat font-500 mt-1 px-1">
                  {profileData.bio.length}/200 символов
                </p>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-montserrat font-600 text-white mb-2 px-1">
                  Город
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C0C0C0]" />
                  <input
                    type="text"
                    value={profileData.city}
                    onChange={(e) => {
                      setProfileData({ ...profileData, city: e.target.value });
                      setHasChanges(true);
                    }}
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-white font-montserrat font-500 focus:outline-none focus:border-[#E85D2F]/50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Professional Info */}
          <div>
            <h3 className="text-xs font-montserrat font-700 text-white uppercase tracking-wider mb-3 px-1">
              Профессиональная информация
            </h3>
            
            {/* Specializations */}
            <div className="mb-4">
              <label className="block text-sm font-montserrat font-600 text-white mb-2 px-1">
                Специализации
              </label>
              <div className="grid grid-cols-2 gap-2">
                {specializations.map((spec) => {
                  const isSelected = profileData.specializations.includes(spec.id);
                  return (
                    <button
                      key={spec.id}
                      onClick={() => toggleSpecialization(spec.id)}
                      className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center justify-center ${
                        isSelected
                          ? 'bg-[#E85D2F]/10 border-[#E85D2F]'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <img src={spec.icon || "/placeholder.svg"} alt={spec.label} className="w-6 h-6 mb-1 object-contain" />
                      <p className="font-montserrat font-700 text-white text-xs text-center">
                        {spec.label}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Experience */}
            <div className="mb-4">
              <label className="block text-sm font-montserrat font-600 text-white mb-2 px-1">
                Опыт работы
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['< 1', '1-3', '3-5', '5+'].map((range) => (
                  <button
                    key={range}
                    onClick={() => {
                      setProfileData({ ...profileData, experience: range });
                      setHasChanges(true);
                    }}
                    className={`h-12 rounded-lg font-montserrat font-700 text-sm transition-all ${
                      profileData.experience === range
                        ? 'bg-[#E85D2F] text-white'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {range} {range !== '< 1' && 'лет'}
                  </button>
                ))}
              </div>
            </div>

            {/* Tools */}
            <div className="mb-4">
              <label className="block text-sm font-montserrat font-600 text-white mb-2 px-1">
                Свой инструмент
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setProfileData({ ...profileData, hasTools: true });
                    setHasChanges(true);
                  }}
                  className={`h-12 rounded-lg font-montserrat font-700 text-sm transition-all ${
                    profileData.hasTools
                      ? 'bg-[#BFFF00] text-black'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  Есть
                </button>
                <button
                  onClick={() => {
                    setProfileData({ ...profileData, hasTools: false });
                    setHasChanges(true);
                  }}
                  className={`h-12 rounded-lg font-montserrat font-700 text-sm transition-all ${
                    !profileData.hasTools
                      ? 'bg-[#E85D2F] text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  Нет
                </button>
              </div>
            </div>

            {/* Hourly Rate */}
            <div>
              <label className="block text-sm font-montserrat font-600 text-white mb-2 px-1">
                Желаемая ставка (₽/час)
              </label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C0C0C0]" />
                  <input
                  type="number"
                  value={profileData.hourlyRate}
                  onChange={(e) => {
                    setProfileData({ ...profileData, hourlyRate: parseInt(e.target.value) });
                    setHasChanges(true);
                  }}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-xl pl-12 pr-16 text-white font-montserrat font-600 focus:outline-none focus:border-[#E85D2F]/50"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 font-montserrat font-600">
                  ₽/час
                </span>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-xs font-montserrat font-700 text-white uppercase tracking-wider mb-3 px-1">
              Социальные сети
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-montserrat font-600 text-white mb-2 px-1">
                  Telegram (опционально)
                </label>
                <input
                  type="text"
                  value={profileData.telegram}
                  onChange={(e) => {
                    setProfileData({ ...profileData, telegram: e.target.value });
                    setHasChanges(true);
                  }}
                  placeholder="@username"
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 text-white font-montserrat font-500 focus:outline-none focus:border-[#E85D2F]/50"
                />
              </div>

              <div>
                <label className="block text-sm font-montserrat font-600 text-white mb-2 px-1">
                  Портфолио (опционально)
                </label>
                <input
                  type="url"
                  value={profileData.portfolio}
                  onChange={(e) => {
                    setProfileData({ ...profileData, portfolio: e.target.value });
                    setHasChanges(true);
                  }}
                  placeholder="https://..."
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 text-white font-montserrat font-500 focus:outline-none focus:border-[#E85D2F]/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button (Bottom Fixed) */}
        {hasChanges && (
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 16,
            background: 'rgba(42, 42, 42, 0.6)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            zIndex: 20,
          }}>
            <button
              onClick={handleSave}
              className="w-full h-14 bg-[#E85D2F] hover:bg-[#D94D1F] rounded-xl font-montserrat font-700 text-white transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Сохранить изменения
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
