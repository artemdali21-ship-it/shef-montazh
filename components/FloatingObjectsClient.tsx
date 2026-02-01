'use client'

export function FloatingObjectsClient() {
  const objects = [
    // Объект 1: Пила (левый средний)
    {
      src: '/images/saw.png',
      style: {
        position: 'fixed' as const,
        top: '38%',
        left: '5%',
        width: '125px',
        height: 'auto',
        opacity: 0.58,
        transform: 'rotate(-18deg)',
        zIndex: 2,
        pointerEvents: 'none' as const,
        animation: 'float 6.8s ease-in-out infinite 1.2s',
        filter: 'drop-shadow(0 6px 14px rgba(0, 0, 0, 0.22))',
      },
    },
    // Объект 3: Кабель (нижний правый)
    {
      src: '/images/cable-coil.png',
      style: {
        position: 'fixed' as const,
        bottom: '16%',
        right: '9%',
        width: '105px',
        height: 'auto',
        opacity: 0.6,
        transform: 'rotate(22deg)',
        zIndex: 1,
        pointerEvents: 'none' as const,
        animation: 'float 8.2s ease-in-out infinite 0.6s',
        filter: 'drop-shadow(0 4px 12px rgba(255, 214, 10, 0.28))',
      },
    },
    // Объект 4: Отвертка (верхний левый)
    {
      src: '/images/screwdriver.png',
      style: {
        position: 'fixed' as const,
        top: '14%',
        left: '8%',
        width: '95px',
        height: 'auto',
        opacity: 0.53,
        transform: 'rotate(-32deg)',
        zIndex: 1,
        pointerEvents: 'none' as const,
        animation: 'float 7s ease-in-out infinite 1.8s',
        filter: 'drop-shadow(0 3px 10px rgba(0, 0, 0, 0.16))',
      },
    },
    // Объект 5: Болты (центр правый)
    {
      src: '/images/bolts.png',
      style: {
        position: 'fixed' as const,
        top: '48%',
        right: '4%',
        width: '88px',
        height: 'auto',
        opacity: 0.5,
        transform: 'rotate(42deg)',
        zIndex: 2,
        pointerEvents: 'none' as const,
        animation: 'float 8.8s ease-in-out infinite 1.4s',
        filter: 'drop-shadow(0 4px 11px rgba(0, 0, 0, 0.18))',
      },
    },
    // Объект 6: Бетон (нижний левый)
    {
      src: '/images/concrete-6.png',
      style: {
        position: 'fixed' as const,
        bottom: '20%',
        left: '7%',
        width: '92px',
        height: 'auto',
        opacity: 0.54,
        transform: 'rotate(-22deg)',
        zIndex: 1,
        pointerEvents: 'none' as const,
        animation: 'float 7.7s ease-in-out infinite 0.9s',
        filter: 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.17))',
      },
    },
  ]

  return (
    <>
      {/* Плавающие 3D объекты */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {objects.map((obj, index) => (
          <img
            key={index}
            src={obj.src}
            alt=""
            style={obj.style}
          />
        ))}
      </div>

      {/* Анимация float */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(var(--rotate, 0deg));
          }
          50% {
            transform: translateY(-25px) rotate(var(--rotate, 0deg));
          }
        }
      `}</style>
    </>
  )
}
