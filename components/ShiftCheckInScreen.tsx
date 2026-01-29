'use client'

import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ShiftCheckInScreenProps {
  shiftId: string;
  shiftTitle: string;
  shiftDate: string;
}

export default function ShiftCheckInScreen({ shiftId, shiftTitle, shiftDate }: ShiftCheckInScreenProps) {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [step, setStep] = useState<'status' | 'photo' | 'confirm'>('status');

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Check if check-in is allowed (within 30 min before shift)
  const isCheckInAllowed = () => {
    const shiftStart = new Date(shiftDate).getTime();
    const now = currentTime.getTime();
    const minutesUntilShift = (shiftStart - now) / 60000;
    return minutesUntilShift <= 30 && minutesUntilShift >= 0;
  };

  const getTimeStatus = () => {
    const shiftStart = new Date(shiftDate).getTime();
    const now = currentTime.getTime();
    const minutesUntilShift = (shiftStart - now) / 60000;

    if (minutesUntilShift > 30) {
      return `Вы можете подтвердить выход за ${Math.ceil(minutesUntilShift)} минут`;
    }
    if (minutesUntilShift < 0) {
      return 'Смена уже началась';
    }
    return `Осталось ${Math.ceil(minutesUntilShift)} минут`;
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      requestGeolocation();
    }
  };

  const requestGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setStep('confirm');
        },
        (error) => {
          setError('Не удалось получить геолокацию. Пожалуйста, включите её в настройках.');
          console.log('[v0] Geolocation error:', error);
        }
      );
    } else {
      setError('Геолокация не поддерживается вашим браузером.');
    }
  };

  const handleStartCheckIn = () => {
    if (!isCheckInAllowed()) {
      setError('Вы можете подтвердить выход только за 30 минут до начала смены');
      return;
    }
    setStep('photo');
  };

  const handleSubmit = async () => {
    if (!photo || !coordinates) {
      setError('Пожалуйста, загрузите фото и дождитесь определения геолокации');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call to save check-in
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('[v0] Check-in saved:', { shiftId, photo: photo.name, coordinates });

      // Redirect to shifts list
      router.push('/shifts');
    } catch (err) {
      setError('Ошибка при подтверждении. Попробуйте ещё раз.');
      console.log('[v0] Check-in error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0A0E27 0%, #1A1F3A 100%)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* HEADER */}
      <div
        style={{
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#FFFFFF',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ArrowLeft size={24} />
        </button>

        <h1
          style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#FFFFFF',
            fontFamily: "'Montserrat', sans-serif",
          }}
        >
          Подтверждение выхода
        </h1>

        <div style={{ width: '40px' }} />
      </div>

      {/* CONTENT */}
      <div
        style={{
          flex: 1,
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          overflow: 'auto',
        }}
      >
        {/* SHIFT INFO */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            padding: '16px',
          }}
        >
          <p
            style={{
              fontSize: '13px',
              color: '#9B9B9B',
              fontWeight: 500,
              margin: '0 0 8px 0',
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
            {shiftTitle}
          </p>
          <p
            style={{
              fontSize: '14px',
              color: '#FFFFFF',
              fontWeight: 600,
              margin: 0,
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
            {shiftDate}
          </p>
        </div>

        {step === 'status' && (
          <>
            {/* TIME STATUS */}
            <div
              style={{
                textAlign: 'center',
              }}
            >
              <p
                style={{
                  fontSize: '14px',
                  color: '#BFFF00',
                  fontWeight: 600,
                  margin: '0 0 12px 0',
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                {currentTime.toLocaleTimeString('ru-RU')}
              </p>
              <p
                style={{
                  fontSize: '14px',
                  color: '#9B9B9B',
                  fontWeight: 500,
                  margin: 0,
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                {getTimeStatus()}
              </p>
            </div>

            {/* CHECKIN BUTTON */}
            <button
              onClick={handleStartCheckIn}
              disabled={!isCheckInAllowed()}
              style={{
                width: '100%',
                height: '56px',
                background: isCheckInAllowed() ? '#BFFF00' : '#4A4A4A',
                border: 'none',
                borderRadius: '12px',
                color: isCheckInAllowed() ? '#0A0E27' : '#9B9B9B',
                fontSize: '16px',
                fontWeight: 700,
                fontFamily: "'Montserrat', sans-serif",
                cursor: isCheckInAllowed() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                transition: 'all 0.3s ease',
                opacity: isCheckInAllowed() ? 1 : 0.5,
              }}
              onMouseEnter={(e) => {
                if (isCheckInAllowed()) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(191, 255, 0, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <MapPin size={20} strokeWidth={2.5} />
              Я вышел на объект
            </button>
          </>
        )}

        {step === 'photo' && (
          <>
            {/* PHOTO UPLOAD */}
            <div
              style={{
                background: 'rgba(232, 93, 47, 0.08)',
                backdropFilter: 'blur(20px)',
                border: '2px dashed rgba(232, 93, 47, 0.3)',
                borderRadius: '16px',
                padding: '32px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(232, 93, 47, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(232, 93, 47, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(232, 93, 47, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(232, 93, 47, 0.3)';
              }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                style={{
                  display: 'none',
                }}
                id="photo-input"
              />
              <label
                htmlFor="photo-input"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                }}
              >
                <Camera size={32} color="#E85D2F" strokeWidth={1.5} />
                <div>
                  <p
                    style={{
                      fontSize: '16px',
                      color: '#FFFFFF',
                      fontWeight: 600,
                      margin: '0 0 4px 0',
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    Загрузите фото объекта
                  </p>
                  <p
                    style={{
                      fontSize: '13px',
                      color: '#9B9B9B',
                      fontWeight: 500,
                      margin: 0,
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    (обязательно)
                  </p>
                </div>
              </label>
            </div>

            {/* PHOTO PREVIEW */}
            {photoPreview && (
              <div
                style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={photoPreview}
                  alt="Preview"
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '300px',
                    objectFit: 'cover',
                  }}
                />
              </div>
            )}

            {/* LOADING GEOLOCATION */}
            {photo && !coordinates && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '20px',
                }}
              >
                <p
                  style={{
                    fontSize: '14px',
                    color: '#BFFF00',
                    fontWeight: 600,
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  ⏳ Определяем вашу геолокацию...
                </p>
              </div>
            )}
          </>
        )}

        {step === 'confirm' && coordinates && (
          <>
            {/* LOCATION CARD */}
            <div
              style={{
                background: 'rgba(191, 255, 0, 0.08)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(191, 255, 0, 0.2)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
              }}
            >
              <MapPin size={24} color="#BFFF00" />
              <div>
                <p
                  style={{
                    fontSize: '12px',
                    color: '#9B9B9B',
                    fontWeight: 500,
                    margin: '0 0 4px 0',
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  Ваша геопозиция
                </p>
                <p
                  style={{
                    fontSize: '14px',
                    color: '#BFFF00',
                    fontWeight: 700,
                    margin: 0,
                    fontFamily: "'Montserrat', sans-serif",
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                </p>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%',
                height: '56px',
                background: '#BFFF00',
                border: 'none',
                borderRadius: '12px',
                color: '#0A0E27',
                fontSize: '16px',
                fontWeight: 700,
                fontFamily: "'Montserrat', sans-serif",
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(191, 255, 0, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {loading ? '⏳ Подтверждаем...' : '✓ Подтвердить выход'}
            </button>
          </>
        )}

        {/* ERROR MESSAGE */}
        {error && (
          <div
            style={{
              background: 'rgba(255, 59, 48, 0.15)',
              border: '1px solid rgba(255, 59, 48, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginTop: '12px',
            }}
          >
            <p
              style={{
                fontSize: '13px',
                color: '#FF3B30',
                fontWeight: 500,
                margin: 0,
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              {error}
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
