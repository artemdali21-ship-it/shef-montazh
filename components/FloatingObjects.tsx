'use client'

export function FloatingObjects() {
  const objects = [
    // Объект 1: Молоток (верхний правый)
    {
      src: '/images/hammer.png',
      style: {
        position: 'fixed' as const,
        top: '10%',
        right: '8%',
        width: '120px',
        height: 'auto',
        opacity: 0.6,
        transform: 'rotate(15deg)',
        zIndex: 1,
        pointerEvents: 'none' as const,
        animation: 'float 6s ease-in-out infinite',
        filter: 'drop-shadow(0 4px 12px rgba(232, 93, 47, 0.3))',
      },
    },
    // Объект 3: Гаечный ключ (нижний правый)
    {
      src: '/images/wrench.png',
      style: {
        position: 'fixed' as const,
        bottom: '15%',
        right: '10%',
        width: '110px',
        height: 'auto',
        opacity: 0.65,
        transform: 'rotate(25deg)',
        zIndex: 1,
        pointerEvents: 'none' as const,
        animation: 'float 8s ease-in-out infinite 0.5s',
        filter: 'drop-shadow(0 4px 12px rgba(255, 214, 10, 0.3))',
      },
    },
    // Объект 4: Бетон (верхний левый)
    {
      src: '/images/concrete-2.png',
      style: {
        position: 'fixed' as const,
        top: '8%',
        left: '12%',
        width: '100px',
        height: 'auto',
        opacity: 0.5,
        transform: 'rotate(-12deg)',
        zIndex: 1,
        pointerEvents: 'none' as const,
        animation: 'float 9s ease-in-out infinite 2s',
        filter: 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.2))',
      },
    },
    // Объект 5: Бетон (центр правый)
    {
      src: '/images/concrete-5.png',
      style: {
        position: 'fixed' as const,
        top: '45%',
        right: '3%',
        width: '90px',
        height: 'auto',
        opacity: 0.45,
        transform: 'rotate(32deg)',
        zIndex: 2,
        pointerEvents: 'none' as const,
        animation: 'float 7.5s ease-in-out infinite 1s',
        filter: 'drop-shadow(0 3px 8px rgba(0, 0, 0, 0.15))',
      },
    },
    // Объект 6: Бетон (нижний левый)
    {
      src: '/images/concrete-3.png',
      style: {
        position: 'fixed' as const,
        bottom: '20%',
        left: '7%',
        width: '95px',
        height: 'auto',
        opacity: 0.55,
        transform: 'rotate(-25deg)',
        zIndex: 1,
        pointerEvents: 'none' as const,
        animation: 'float 8.5s ease-in-out infinite 0.8s',
        filter: 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.2))',
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
