'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  ArrowRight,
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  Users,
  Wallet,
  Plus,
  Minus,
  Shield,
  Check,
  Send,
  Wrench,
  Palette,
  Mountain,
  Zap,
  Flame,
  Award,
  Moon,
} from 'lucide-react';
import { Header } from './Header';

const categories = [
  { value: 'montage', label: 'Монтажник', icon: Wrench },
  { value: 'decorator', label: 'Декоратор', icon: Palette },
  { value: 'alpinist', label: 'Альпинист', icon: Mountain },
  { value: 'electrician', label: 'Электрик', icon: Zap },
  { value: 'welder', label: 'Сварщик', icon: Flame },
];

const requirements = [
  { id: 'own_tools', label: 'Свой инструмент', icon: Wrench },
  { id: 'safety_gear', label: 'Спецодежда и СИЗ', icon: Shield },
  { id: 'experience', label: 'Опыт работы от 1 года', icon: Award },
  { id: 'night_ready', label: 'Готовность к ночной работе', icon: Moon },
];

const rateSuggestions = [1500, 2000, 2500, 3000, 3500];

export default function CreateShiftScreen({ onClose, onSuccess }: { onClose?: () => void; onSuccess?: () => void }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    location: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    workers: 1,
    rate: 2500,
    requirements: [] as string[],
  });

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return 0;
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    let startMins = startH * 60 + startM;
    let endMins = endH * 60 + endM;
    if (endMins < startMins) endMins += 24 * 60;
    return Math.round((endMins - startMins) / 60 * 10) / 10;
  };

  const duration = calculateDuration(formData.startTime, formData.endTime);
  const totalAmount = formData.workers * formData.rate;
  const commission = Math.round(totalAmount * 0.12);
  const escrowAmount = totalAmount + commission;

  const isStep1Valid =
  const isStep1Valid =
    formData.title.length > 0 &&
    formData.category &&
    formData.location.length > 0 &&
    formData.date &&
    formData.startTime &&
    formData.endTime &&
    formData.workers > 0 &&
    formData.rate >= 500;

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title) newErrors.title = 'Укажите название работы';
    if (!formData.category) newErrors.category = 'Выберите категорию';
    if (!formData.location) newErrors.location = 'Укажите локацию';
    if (!formData.date) newErrors.date = 'Выберите дату';
    if (!formData.startTime) newErrors.startTime = 'Укажите время начала';
    if (!formData.endTime) newErrors.endTime = 'Укажите время окончания';
    if (formData.rate < 500) newErrors.rate = 'Минимальная ставка 500 ₽';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateStep1()) {
      setStep(2);
      setErrors({});
    }
  };

  const toggleRequirement = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.includes(id)
        ? prev.requirements.filter((r) => r !== id)
        : [...prev.requirements, id],
    }));
  };

  const handleCreateShift = () => {
    console.log('[v0] Creating shift:', formData);
    // TODO: Send to API to create shift
    if (onSuccess) onSuccess();
    alert('Смена успешно создана!');
  };

  return (
    <div className="w-full flex flex-col">
      {/* Header */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '64px',
          background: 'rgba(42, 42, 42, 0.98)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: '20px',
          paddingRight: '20px',
          zIndex: 50,
        }}
      >
        <button
          onClick={() => {
            if (onClose) onClose()
            console.log('[v0] Close shift creation form')
          }}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
          }}
        >
          <X size={20} color="#FFFFFF" />
        </button>

        <h1
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 700,
            fontSize: '16px',
            color: '#FFFFFF',
            margin: 0,
            flex: 1,
            textAlign: 'center',
          }}
        >
          Создать смену
        </h1>

        <div
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 600,
            fontSize: '13px',
            color: '#9B9B9B',
            width: '40px',
            textAlign: 'right',
          }}
        >
          {step} / 2
        </div>
      </header>

      {/* Progress bar */}
      <div
        style={{
          position: 'fixed',
          top: '64px',
          left: 0,
          right: 0,
          height: '3px',
          background: 'rgba(255, 255, 255, 0.08)',
          zIndex: 49,
        }}
      >
        <div
          style={{
            height: '3px',
            background: '#E85D2F',
            width: `${step === 1 ? 50 : 100}%`,
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      {/* Content */}
      <div style={{
        paddingTop: '67px', 
        paddingBottom: step === 1 ? '120px' : '80px',
        maxHeight: 'calc(100vh - 67px)',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}>
        {step === 1 ? (
            <div style={{ padding: '24px 20px' }}>
              {/* Job Details Section */}
              <div style={{ marginBottom: '32px' }}>
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <Briefcase size={20} color="#E85D2F" />
                  <h2
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 700,
                      fontSize: '18px',
                      color: '#FFFFFF',
                      margin: 0,
                    }}
                  >
                    Детали работы
                  </h2>
                </div>

                {/* Title */}
                <div style={{ marginBottom: '20px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 600,
                      fontSize: '13px',
                      color: '#FFFFFF',
                      marginBottom: '8px',
                    }}
                  >
                    Название работы
                  </label>
                  <input
                    type="text"
                    placeholder="Например: Монтаж выставочного стенда"
                    maxLength={80}
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, title: e.target.value }))
                    }
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: errors.title
                        ? '1px solid #E85D2F'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 500,
                      fontSize: '14px',
                      color: '#FFFFFF',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s ease',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#E85D2F';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                  />
                  {errors.title && (
                    <div
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 400,
                        fontSize: '11px',
                        color: '#E85D2F',
                        marginTop: '6px',
                      }}
                    >
                      {errors.title}
                    </div>
                  )}
                </div>

                {/* Category */}
                <div style={{ marginBottom: '20px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 600,
                      fontSize: '13px',
                      color: '#FFFFFF',
                      marginBottom: '8px',
                    }}
                  >
                    Категория специалиста
                  </label>
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setCategoryOpen(!categoryOpen)}
                      style={{
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: errors.category
                          ? '1px solid #E85D2F'
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '14px 16px',
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 500,
                        fontSize: '14px',
                        color: '#FFFFFF',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      }}
                    >
                      {SelectedCategoryIcon && (
                        <SelectedCategoryIcon size={18} color="#E85D2F" />
                      )}
                      <span>{selectedCategory?.label || 'Выберите категорию'}</span>
                    </button>

                    {categoryOpen && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          marginTop: '8px',
                          background: 'rgba(42, 42, 42, 0.98)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          zIndex: 100,
                          overflow: 'hidden',
                        }}
                      >
                        {categories.map((cat) => {
                          const CatIcon = cat.icon;
                          return (
                            <button
                              key={cat.value}
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  category: cat.value,
                                }));
                                setCategoryOpen(false);
                              }}
                              style={{
                                width: '100%',
                                padding: '14px 16px',
                                background:
                                  formData.category === cat.value
                                    ? 'rgba(232, 93, 47, 0.15)'
                                    : 'transparent',
                                border: 'none',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                fontFamily: "'Montserrat', sans-serif",
                                fontWeight: 600,
                                fontSize: '14px',
                                color: '#FFFFFF',
                                textAlign: 'left',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background =
                                  formData.category === cat.value
                                    ? 'rgba(232, 93, 47, 0.15)'
                                    : 'transparent';
                              }}
                            >
                              <CatIcon size={18} color="#E85D2F" />
                              {cat.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div style={{ marginBottom: '20px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 600,
                      fontSize: '13px',
                      color: '#FFFFFF',
                      marginBottom: '8px',
                    }}
                  >
                    Локация
                  </label>
                  <div style={{ position: 'relative' }}>
                    <MapPin
                      size={18}
                      color="#E85D2F"
                      style={{
                        position: 'absolute',
                        left: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Крокус Экспо, павильон 3"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, location: e.target.value }))
                      }
                      style={{
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: errors.location
                          ? '1px solid #E85D2F'
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '14px 16px 14px 44px',
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 500,
                        fontSize: '14px',
                        color: '#FFFFFF',
                        boxSizing: 'border-box',
                        transition: 'all 0.2s ease',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#E85D2F';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      }}
                    />
                  </div>
                  {errors.location && (
                    <div
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 400,
                        fontSize: '11px',
                        color: '#E85D2F',
                        marginTop: '6px',
                      }}
                    >
                      {errors.location}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div style={{ marginBottom: '20px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 600,
                      fontSize: '13px',
                      color: '#FFFFFF',
                      marginBottom: '8px',
                    }}
                  >
                    Описание работ
                  </label>
                  <textarea
                    placeholder="Опишите задачи: сборка конструкций, установка панелей..."
                    rows={4}
                    maxLength={500}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 500,
                      fontSize: '14px',
                      color: '#FFFFFF',
                      resize: 'none',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s ease',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#E85D2F';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                  />
                </div>
              </div>

              {/* Schedule Section */}
              <div style={{ marginBottom: '32px' }}>
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <Calendar size={20} color="#E85D2F" />
                  <h2
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 700,
                      fontSize: '18px',
                      color: '#FFFFFF',
                      margin: 0,
                    }}
                  >
                    Расписание
                  </h2>
                </div>

                {/* Date */}
                <div style={{ marginBottom: '20px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 600,
                      fontSize: '13px',
                      color: '#FFFFFF',
                      marginBottom: '8px',
                    }}
                  >
                    Дата смены
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, date: e.target.value }))
                    }
                    min={new Date().toISOString().split('T')[0]}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: errors.date
                        ? '1px solid #E85D2F'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 500,
                      fontSize: '14px',
                      color: '#FFFFFF',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s ease',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#E85D2F';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                  />
                </div>

                {/* Time Range */}
                <div style={{ marginBottom: '20px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 600,
                      fontSize: '13px',
                      color: '#FFFFFF',
                      marginBottom: '8px',
                    }}
                  >
                    Время работы
                  </label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, startTime: e.target.value }))
                      }
                      placeholder="18:00"
                      style={{
                        flex: 1,
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: errors.startTime
                          ? '1px solid #E85D2F'
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '14px 16px',
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 500,
                        fontSize: '14px',
                        color: '#FFFFFF',
                        boxSizing: 'border-box',
                        transition: 'all 0.2s ease',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#E85D2F';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      }}
                    />
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, endTime: e.target.value }))
                      }
                      placeholder="02:00"
                      style={{
                        flex: 1,
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: errors.endTime
                          ? '1px solid #E85D2F'
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '14px 16px',
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 500,
                        fontSize: '14px',
                        color: '#FFFFFF',
                        boxSizing: 'border-box',
                        transition: 'all 0.2s ease',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#E85D2F';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      }}
                    />
                  </div>
                  {duration > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        gap: '6px',
                        alignItems: 'center',
                        marginTop: '10px',
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 500,
                        fontSize: '12px',
                        color: '#BFFF00',
                      }}
                    >
                      <Clock size={14} />
                      Продолжительность: {duration} часов
                    </div>
                  )}
                </div>
              </div>

              {/* Team Size Section */}
              <div style={{ marginBottom: '32px' }}>
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <Users size={20} color="#E85D2F" />
                  <h2
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 700,
                      fontSize: '18px',
                      color: '#FFFFFF',
                      margin: 0,
                    }}
                  >
                    Размер бригады
                  </h2>
                </div>

                <label
                  style={{
                    display: 'block',
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 600,
                    fontSize: '13px',
                    color: '#FFFFFF',
                    marginBottom: '14px',
                  }}
                >
                  Сколько человек нужно?
                </label>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    height: '56px',
                  }}
                >
                  <button
                    onClick={() =>
                      formData.workers > 1 &&
                      setFormData((prev) => ({ ...prev, workers: prev.workers - 1 }))
                    }
                    disabled={formData.workers === 1}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: formData.workers > 1 ? 'pointer' : 'not-allowed',
                      opacity: formData.workers === 1 ? 0.4 : 1,
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (formData.workers > 1) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                  >
                    <Minus size={20} color="#FFFFFF" />
                  </button>

                  <div
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 800,
                      fontSize: '32px',
                      color: '#FFFFFF',
                      letterSpacing: '-0.5px',
                      minWidth: '60px',
                      textAlign: 'center',
                    }}
                  >
                    {formData.workers}
                  </div>

                  <button
                    onClick={() =>
                      formData.workers < 20 &&
                      setFormData((prev) => ({ ...prev, workers: prev.workers + 1 }))
                    }
                    disabled={formData.workers === 20}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'rgba(232, 93, 47, 0.15)',
                      border: '1px solid #E85D2F',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: formData.workers < 20 ? 'pointer' : 'not-allowed',
                      opacity: formData.workers === 20 ? 0.4 : 1,
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (formData.workers < 20) {
                        e.currentTarget.style.background = 'rgba(232, 93, 47, 0.25)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(232, 93, 47, 0.15)';
                    }}
                  >
                    <Plus size={20} color="#E85D2F" />
                  </button>
                </div>
              </div>

              {/* Payment Section */}
              <div style={{ marginBottom: '32px' }}>
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <Wallet size={20} color="#E85D2F" />
                  <h2
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 700,
                      fontSize: '18px',
                      color: '#FFFFFF',
                      margin: 0,
                    }}
                  >
                    Оплата
                  </h2>
                </div>

                <label
                  style={{
                    display: 'block',
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 600,
                    fontSize: '13px',
                    color: '#FFFFFF',
                    marginBottom: '8px',
                  }}
                >
                  Ставка за смену (на 1 человека)
                </label>

                <div style={{ position: 'relative', marginBottom: '12px' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 600,
                      fontSize: '14px',
                      color: '#9B9B9B',
                      pointerEvents: 'none',
                    }}
                  >
                    ₽
                  </span>
                  <input
                    type="number"
                    placeholder="2 500"
                    min={500}
                    step={100}
                    value={formData.rate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        rate: Math.max(500, parseInt(e.target.value) || 0),
                      }))
                    }
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: errors.rate
                        ? '1px solid #E85D2F'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '14px 16px 14px 40px',
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 500,
                      fontSize: '14px',
                      color: '#FFFFFF',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s ease',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#E85D2F';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                  />
                </div>

                {/* Rate Suggestions */}
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap',
                    marginBottom: '20px',
                  }}
                >
                  {rateSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, rate: suggestion }))
                      }
                      style={{
                        padding: '8px 14px',
                        background:
                          formData.rate === suggestion
                            ? 'rgba(232, 93, 47, 0.15)'
                            : 'rgba(255, 255, 255, 0.05)',
                        border:
                          formData.rate === suggestion
                            ? '1px solid #E85D2F'
                            : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 600,
                        fontSize: '13px',
                        color:
                          formData.rate === suggestion ? '#E85D2F' : '#9B9B9B',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          formData.rate === suggestion
                            ? 'rgba(232, 93, 47, 0.25)'
                            : 'rgba(255, 255, 255, 0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          formData.rate === suggestion
                            ? 'rgba(232, 93, 47, 0.15)'
                            : 'rgba(255, 255, 255, 0.05)';
                      }}
                    >
                      {suggestion.toLocaleString('ru-RU')} ₽
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Calculation Card */}
              <div
                style={{
                  marginLeft: '-20px',
                  marginRight: '-20px',
                  marginBottom: '20px',
                  background: 'rgba(169, 169, 169, 0.3)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '20px',
                  boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.3)',
                  zIndex: 8,
                  marginX: '20px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '14px',
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 600,
                      fontSize: '13px',
                      color: '#9B9B9B',
                    }}
                  >
                    ИТОГО К ОПЛАТЕ
                  </div>
                  <Shield size={16} color="#BFFF00" />
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px',
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 600,
                      fontSize: '14px',
                      color: '#FFFFFF',
                    }}
                  >
                    Эскроу-блокировка
                  </div>
                  <div
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 800,
                      fontSize: '28px',
                      color: '#BFFF00',
                      letterSpacing: '-0.5px',
                    }}
                  >
                    {escrowAmount.toLocaleString('ru-RU')} ₽
                  </div>
                </div>

                <div
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 400,
                    fontSize: '12px',
                    color: '#FFFFFF',
                  }}
                >
                  {formData.workers} чел. × {formData.rate.toLocaleString('ru-RU')} ₽ +
                  комиссия {commission.toLocaleString('ru-RU')} ₽ (12%)
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '24px 20px' }}>
              {/* Requirements Section */}
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  marginBottom: '20px',
                }}
              >
                <Award size={20} color="#E85D2F" />
                <h2
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 700,
                    fontSize: '18px',
                    color: '#FFFFFF',
                    margin: 0,
                  }}
                >
                  Требования к специалистам
                </h2>
              </div>

              {requirements.map((req) => {
                const ReqIcon = req.icon;
                return (
                  <button
                    key={req.id}
                    onClick={() => toggleRequirement(req.id)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: formData.requirements.includes(req.id)
                        ? 'rgba(191, 255, 0, 0.1)'
                        : 'rgba(255, 255, 255, 0.05)',
                      border:
                        formData.requirements.includes(req.id)
                          ? '1px solid #BFFF00'
                          : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      marginBottom: '10px',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = formData.requirements.includes(
                        req.id
                      )
                        ? 'rgba(191, 255, 0, 0.15)'
                        : 'rgba(255, 255, 255, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = formData.requirements.includes(
                        req.id
                      )
                        ? 'rgba(191, 255, 0, 0.1)'
                        : 'rgba(255, 255, 255, 0.05)';
                    }}
                  >
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        background: formData.requirements.includes(req.id)
                          ? '#BFFF00'
                          : 'transparent',
                        border: formData.requirements.includes(req.id)
                          ? 'none'
                          : '2px solid rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {formData.requirements.includes(req.id) && (
                        <Check size={16} color="#1A1A1A" strokeWidth={3} />
                      )}
                    </div>
                    <ReqIcon size={20} color="#E85D2F" />
                    <div
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 600,
                        fontSize: '14px',
                        color: '#FFFFFF',
                      }}
                    >
                      {req.label}
                    </div>
                  </button>
                );
              })}

              {/* Preview Section */}
              <div style={{ marginTop: '32px', marginBottom: '100px' }}>
                <h3
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 700,
                    fontSize: '18px',
                    color: '#FFFFFF',
                    marginBottom: '16px',
                    margin: 0,
                  }}
                >
                  Предпросмотр смены
                </h3>

                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '14px',
                    padding: '18px',
                    marginBottom: '20px',
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 700,
                      fontSize: '16px',
                      color: '#FFFFFF',
                      marginBottom: '8px',
                    }}
                  >
                    {formData.title}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 500,
                      fontSize: '13px',
                      color: '#9B9B9B',
                      marginBottom: '12px',
                    }}
                  >
                    {selectedCategory?.label} • {formData.location}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 500,
                      fontSize: '12px',
                      color: '#6B6B6B',
                      marginBottom: '14px',
                      lineHeight: 1.4,
                    }}
                  >
                    {formData.description}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '12px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 600,
                        fontSize: '13px',
                        color: '#FFFFFF',
                      }}
                    >
                      {formData.workers} чел. • {formData.date}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 800,
                        fontSize: '18px',
                        color: '#E85D2F',
                      }}
                    >
                      {(formData.workers * formData.rate).toLocaleString('ru-RU')} ₽
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom CTA Bar */}
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'rgba(26, 26, 26, 0.98)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.3)',
            padding: '16px 20px 28px 20px',
            zIndex: 40,
          }}
        >
          <button
            onClick={step === 1 ? handleContinue : handleCreateShift}
            disabled={step === 1 && !isStep1Valid}
            style={{
              width: '100%',
              height: '56px',
              background:
                step === 1 && !isStep1Valid
                  ? 'rgba(232, 93, 47, 0.3)'
                  : '#E85D2F',
              border: 'none',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,
              fontSize: '15px',
              color: '#FFFFFF',
              letterSpacing: '0.3px',
              cursor:
                step === 1 && !isStep1Valid ? 'not-allowed' : 'pointer',
              opacity: step === 1 && !isStep1Valid ? 0.5 : 1,
              boxShadow:
                step === 1 && !isStep1Valid
                  ? 'none'
                  : '0 6px 20px rgba(232, 93, 47, 0.5)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (step === 1 && !isStep1Valid) return;
              e.currentTarget.style.background = '#D04D1F';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow =
                '0 8px 24px rgba(232, 93, 47, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#E85D2F';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow =
                '0 6px 20px rgba(232, 93, 47, 0.5)';
            }}
          >
            {step === 1 ? (
              <>
                Продолжить
                <ArrowRight size={20} strokeWidth={2.5} />
              </>
            ) : (
              <>
                Создать смену
                <Send size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateShiftScreen;
