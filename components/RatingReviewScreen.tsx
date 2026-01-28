'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  CheckCircle,
  Building2,
  Briefcase,
  HardHat,
  User,
  Star,
  MessageSquare,
  Shield,
  Wallet,
  Heart,
  Award,
  Clock,
  Info,
  Send,
  EyeOff,
} from 'lucide-react';
import { Header } from './Header';

export default function RatingReviewScreen() {
  const router = useRouter()
  const [ratingData, setRatingData] = useState({
    overall: 0,
    criteria: {
      communication: 0,
      conditions: 0,
      payment: 0,
      respect: 0,
    },
  });

  const [reviewText, setReviewText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const shift = {
    title: 'Монтаж выставочного стенда',
    date: '28 января',
    duration: 8,
    location: 'Крокус Экспо',
  };

  const ratee = {
    type: 'company',
    name: 'Decor Factory',
    role: 'Заказчик',
    currentRating: 4.8,
  };

  const clientCriteria = [
    {
      id: 'communication',
      label: 'Коммуникация',
      description: 'Четкость ТЗ и оперативность ответов',
      icon: MessageSquare,
    },
    {
      id: 'conditions',
      label: 'Условия работы',
      description: 'Площадка, инструменты, безопасность',
      icon: Shield,
    },
    {
      id: 'payment',
      label: 'Оплата',
      description: 'Соблюдение договоренностей',
      icon: Wallet,
    },
    {
      id: 'respect',
      label: 'Отношение',
      description: 'Уважение к исполнителям',
      icon: Heart,
    },
  ];

  const reviewPrompts = [
    'Отличная организация',
    'Чёткие инструкции',
    'Профессионализм',
    'Хорошие условия',
    'Качественная работа',
    'Пунктуальность',
  ];

  const ratingDescriptions = {
    1: 'Неудовлетворительно',
    2: 'Плохо',
    3: 'Удовлетворительно',
    4: 'Хорошо',
    5: 'Отлично',
  };

  const handleStarClick = (value, criteriaId = null) => {
    if (criteriaId) {
      setRatingData({
        ...ratingData,
        criteria: {
          ...ratingData.criteria,
          [criteriaId]: value,
        },
      });
    } else {
      setRatingData({
        ...ratingData,
        overall: value,
      });
    }
  };

  const handlePromptClick = (prompt) => {
    setReviewText(
      reviewText ? `${reviewText} ${prompt}` : prompt,
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setShowSuccess(true);
    setTimeout(() => {
      // Navigate to next screen
    }, 3000);
  };

  const canSubmit = ratingData.overall > 0;

  const renderStars = (currentRating, criteriaId = null) => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() =>
              handleStarClick(star, criteriaId)
            }
            style={{
              width: '32px',
              height: '32px',
              background:
                star <= currentRating
                  ? 'rgba(255, 214, 10, 0.15)'
                  : 'rgba(255, 255, 255, 0.05)',
              border:
                star <= currentRating
                  ? '2px solid #FFD60A'
                  : '2px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            className="hover:scale-110"
          >
            <Star
              size={16}
              fill={
                star <= currentRating
                  ? '#FFD60A'
                  : 'none'
              }
              color={
                star <= currentRating
                  ? '#FFD60A'
                  : '#6B6B6B'
              }
            />
          </button>
        ))}
      </div>
    );
  };

  const renderLargeStars = (currentRating) => {
    return (
      <div className="flex justify-center gap-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleStarClick(star)}
            style={{
              width: '52px',
              height: '52px',
              background:
                star <= currentRating
                  ? 'rgba(255, 214, 10, 0.15)'
                  : 'rgba(255, 255, 255, 0.05)',
              border:
                star <= currentRating
                  ? '2px solid #FFD60A'
                  : '2px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            className="hover:scale-110"
          >
            <Star
              size={28}
              fill={
                star <= currentRating
                  ? '#FFD60A'
                  : 'none'
              }
              color={
                star <= currentRating
                  ? '#FFD60A'
                  : '#6B6B6B'
              }
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        backgroundImage: 'url(/images/bg-dashboard.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        fontFamily: "'Montserrat', system-ui, -apple-system, sans-serif",
        position: 'relative',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.3)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* FLOATING TAPE MAIN - Rating (SMALL - far) */}
      <img
        src="/images/tape-main.png"
        alt=""
        style={{
          position: 'fixed',
          bottom: '15%',
          right: '4%',
          width: '80px',
          height: 'auto',
          opacity: 0.1,
          transform: 'rotate(45deg)',
          zIndex: 0,
          pointerEvents: 'none',
          animation: 'float 6s ease-in-out infinite 1.5s',
        }}
      />
      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* HEADER */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '64px',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom:
              '1px solid rgba(255, 255, 255, 0.08)',
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 100,
          }}
        >
          <button
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
              border:
                '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={20} color="#FFFFFF" />
          </button>
          <div
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,
              fontSize: '16px',
              color: '#FFFFFF',
            }}
          >
            Оценка смены
          </div>
          <button
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 600,
              fontSize: '13px',
              color: '#E0E0E0',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Пропустить
          </button>
        </div>

        {/* CONTENT */}
        <div style={{ paddingTop: '80px', paddingBottom: '120px', overflowY: 'auto', maxHeight: 'calc(100vh - 80px)' }}>
          {/* SHIFT INFO CARD */}
          <div style={{ padding: '20px' }}>
            <div
              style={{
                background: 'rgba(169, 169, 169, 0.2)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border:
                  '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '18px',
                display: 'flex',
                gap: '14px',
                alignItems: 'flex-start',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'rgba(191, 255, 0, 0.15)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <CheckCircle
                  size={24}
                  color="#BFFF00"
                />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 500,
                    fontSize: '11px',
                    color: '#BFFF00',
                    letterSpacing: '0.5px',
                    marginBottom: '4px',
                  }}
                >
                  СМЕНА ЗАВЕРШЕНА
                </div>
                <div
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 700,
                    fontSize: '16px',
                    color: '#FFFFFF',
                    marginBottom: '6px',
                  }}
                >
                  {shift.title}
                </div>
                <div
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 500,
                    fontSize: '12px',
                    color: '#E0E0E0',
                  }}
                >
                  {shift.date} • {shift.duration} часов •{' '}
                  {shift.location}
                </div>
              </div>
            </div>
          </div>

          {/* PERSON CARD */}
          <div style={{ padding: '0 20px', marginBottom: '24px' }}>
            <div
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                fontSize: '17px',
                color: '#FFFFFF',
                marginBottom: '14px',
              }}
            >
              Оцените работу
            </div>
            <div
              style={{
                background: 'rgba(169, 169, 169, 0.2)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border:
                  '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '18px',
                display: 'flex',
                gap: '14px',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(232, 93, 47, 0.2)',
                  border:
                    '2px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Building2
                  size={32}
                  color="#E85D2F"
                />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 700,
                    fontSize: '17px',
                    color: '#FFFFFF',
                    marginBottom: '4px',
                  }}
                >
                  {ratee.name}
                </div>
                <div
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 500,
                    fontSize: '13px',
                    color: '#E0E0E0',
                    display: 'flex',
                    gap: '6px',
                    alignItems: 'center',
                  }}
                >
                  <Briefcase size={12} />
                  {ratee.role}
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: '4px',
                    alignItems: 'center',
                    marginTop: '6px',
                  }}
                >
                  <Star
                    size={12}
                    fill="#FFD60A"
                    color="#FFD60A"
                  />
                  <span
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 600,
                      fontSize: '12px',
                      color: '#FFD60A',
                    }}
                  >
                    {ratee.currentRating} средний
                    рейтинг
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* OVERALL RATING */}
          <div style={{ padding: '0 20px', marginBottom: '24px' }}>
            <div
              style={{
                background: 'rgba(169, 169, 169, 0.2)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border:
                  '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '28px 20px',
              }}
            >
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#E0E0E0',
                  textAlign: 'center',
                  marginBottom: '16px',
                }}
              >
                Общая оценка
              </div>
              {renderLargeStars(ratingData.overall)}
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 800,
                  fontSize: '32px',
                  color: '#FFD60A',
                  textAlign: 'center',
                  letterSpacing: '-0.5px',
                  lineHeight: 1,
                  marginTop: '16px',
                  marginBottom: '8px',
                }}
              >
                {ratingData.overall > 0
                  ? `${ratingData.overall}.0`
                  : 'Не выбрано'}
              </div>
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 500,
                  fontSize: '13px',
                  color: '#E0E0E0',
                  textAlign: 'center',
                }}
              >
                {ratingDescriptions[
                  ratingData.overall
                ] || ''}
              </div>
            </div>
          </div>

          {/* CRITERIA */}
          <div style={{ padding: '0 20px', marginBottom: '24px' }}>
            <div
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                fontSize: '17px',
                color: '#FFFFFF',
                marginBottom: '14px',
              }}
            >
              Детальная оценка
            </div>
            {clientCriteria.map((criteria) => {
              const IconComponent = criteria.icon;
              return (
                <div
                  key={criteria.id}
                  style={{
                    background: 'rgba(169, 169, 169, 0.2)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border:
                      '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px',
                    padding: '18px',
                    marginBottom: '12px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '12px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          background:
                            'rgba(232, 93, 47, 0.15)',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <IconComponent
                          size={18}
                          color="#E85D2F"
                        />
                      </div>
                      <div>
                        <div
                          style={{
                            fontFamily: "'Montserrat', sans-serif",
                            fontWeight: 700,
                            fontSize: '15px',
                            color: '#FFFFFF',
                          }}
                        >
                          {criteria.label}
                        </div>
                        <div
                          style={{
                            fontFamily: "'Montserrat', sans-serif",
                            fontWeight: 400,
                            fontSize: '11px',
                            color: '#E0E0E0',
                            lineHeight: 1.4,
                          }}
                        >
                          {criteria.description}
                        </div>
                      </div>
                    </div>
                    {ratingData.criteria[criteria.id] > 0 && (
                      <div
                        style={{
                          padding: '4px 10px',
                          background:
                            'rgba(255, 214, 10, 0.15)',
                          borderRadius: '8px',
                          fontFamily: "'Montserrat', sans-serif",
                          fontWeight: 700,
                          fontSize: '13px',
                          color: '#FFD60A',
                        }}
                      >
                        {
                          ratingData.criteria[criteria.id]
                        }
                        ★
                      </div>
                    )}
                  </div>
                  {renderStars(
                    ratingData.criteria[criteria.id],
                    criteria.id,
                  )}
                </div>
              );
            })}
          </div>

          {/* REVIEW */}
          <div style={{ padding: '0 20px', marginBottom: '24px' }}>
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
                  fontWeight: 700,
                  fontSize: '17px',
                  color: '#FFFFFF',
                }}
              >
                Комментарий
              </div>
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 500,
                  fontSize: '12px',
                  color: '#E0E0E0',
                }}
              >
                Необязательно
              </div>
            </div>
            <textarea
              value={reviewText}
              onChange={(e) =>
                setReviewText(e.target.value.slice(0, 500))
              }
              placeholder="Расскажите о своём опыте работы. Что было особенно хорошо или что можно улучшить?"
              style={{
                width: '100%',
                minHeight: '120px',
                background: 'rgba(255, 255, 255, 0.05)',
                border:
                  '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '14px',
                padding: '16px',
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 400,
                fontSize: '14px',
                color: '#FFFFFF',
                lineHeight: 1.6,
                resize: 'vertical',
              }}
            />
            <div
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 400,
                fontSize: '11px',
                color: '#E0E0E0',
                textAlign: 'right',
                marginTop: '8px',
              }}
            >
              {reviewText.length} / 500
            </div>
            {reviewText.length === 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                {reviewPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handlePromptClick(prompt)}
                    style={{
                      padding: '8px 14px',
                      background:
                        'rgba(255, 255, 255, 0.05)',
                      border:
                        '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '20px',
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 500,
                      fontSize: '12px',
                      color: '#E0E0E0',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background =
                        'rgba(232, 93, 47, 0.15)';
                      e.target.style.borderColor =
                        '#E85D2F';
                      e.target.style.color =
                        '#E85D2F';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background =
                        'rgba(255, 255, 255, 0.05)';
                      e.target.style.borderColor =
                        'rgba(255, 255, 255, 0.1)';
                      e.target.style.color =
                        '#E0E0E0';
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ANONYMOUS TOGGLE */}
          <div style={{ padding: '0 20px', marginBottom: '24px' }}>
            <div
              style={{
                background: 'rgba(169, 169, 169, 0.2)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border:
                  '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', gap: '12px' }}>
                <EyeOff size={20} color="#E0E0E0" />
                <div>
                  <div
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 600,
                      fontSize: '14px',
                      color: '#FFFFFF',
                    }}
                  >
                    Анонимный отзыв
                  </div>
                  <div
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 400,
                      fontSize: '11px',
                      color: '#E0E0E0',
                      marginTop: '2px',
                    }}
                  >
                    Ваше имя не будет показано
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsAnonymous(!isAnonymous)}
                style={{
                  width: '48px',
                  height: '28px',
                  background: isAnonymous
                    ? '#BFFF00'
                    : 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '14px',
                  border: 'none',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    width: '22px',
                    height: '22px',
                    background: '#FFFFFF',
                    borderRadius: '50%',
                    top: '3px',
                    left: isAnonymous ? '23px' : '3px',
                    transition: 'left 0.2s ease',
                  }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '16px 20px 28px 20px',
            zIndex: 100,
          }}
        >
          <div
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 400,
              fontSize: '11px',
              color: '#E0E0E0',
              textAlign: 'center',
              marginBottom: '12px',
              display: 'flex',
              gap: '6px',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Info size={12} />
            Ваша оценка влияет на рейтинг и будущие
            ставки
          </div>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            style={{
              width: '100%',
              height: '56px',
              background: canSubmit
                ? '#E85D2F'
                : 'rgba(232, 93, 47, 0.3)',
              borderRadius: '14px',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,
              fontSize: '15px',
              color: 'white',
              letterSpacing: '0.3px',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              boxShadow: canSubmit
                ? '0 6px 20px rgba(232, 93, 47, 0.5)'
                : 'none',
              transition: 'all 0.2s ease',
              opacity: isSubmitting ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (canSubmit) {
                e.target.style.background =
                  '#D04D1F';
                e.target.style.transform =
                  'translateY(-2px)';
                e.target.style.boxShadow =
                  '0 8px 24px rgba(232, 93, 47, 0.6)';
              }
            }}
            onMouseLeave={(e) => {
              if (canSubmit) {
                e.target.style.background =
                  '#E85D2F';
                e.target.style.transform =
                  'translateY(0)';
                e.target.style.boxShadow =
                  '0 6px 20px rgba(232, 93, 47, 0.5)';
              }
            }}
          >
            {isSubmitting ? (
              <>
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    border:
                      '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    animation:
                      'spin 1s linear infinite',
                  }}
                />
                Отправка...
              </>
            ) : (
              <>
                <Send size={20} />
                Отправить оценку
              </>
            )}
          </button>
        </div>

        {/* SUCCESS MODAL */}
        {showSuccess && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 200,
            }}
          >
            <div
              style={{
                maxWidth: '320px',
                background: '#2A2A2A',
                border:
                  '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: '32px 24px',
                textAlign: 'center',
                animation: 'scaleIn 0.3s ease',
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  background:
                    'rgba(191, 255, 0, 0.15)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px auto',
                }}
              >
                <CheckCircle
                  size={48}
                  color="#BFFF00"
                />
              </div>
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  fontSize: '20px',
                  color: '#FFFFFF',
                  marginBottom: '12px',
                }}
              >
                Спасибо за отзыв!
              </div>
              <div
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 400,
                  fontSize: '14px',
                  color: '#E0E0E0',
                  lineHeight: 1.6,
                  marginBottom: '24px',
                }}
              >
                Ваша оценка помогает улучшать качество
                работы платформы
              </div>
              <button
                onClick={() => setShowSuccess(false)}
                style={{
                  width: '100%',
                  height: '48px',
                  background: '#E85D2F',
                  borderRadius: '12px',
                  border: 'none',
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  fontSize: '14px',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                Готово
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
