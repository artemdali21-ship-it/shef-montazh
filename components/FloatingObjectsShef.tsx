'use client'

export function FloatingObjectsShef() {
  const objects = [
    // Объект 1: Каска (верхний правый)
    {
      src: '/images/helmet.png',
      style: {
        position: 'fixed' as const,
        top: '8%',
        right: '6%',
        width: '130px',
        height: 'auto',
        opacity: 0.65,
        transform: 'rotate(-12deg)',
        zIndex: 1,
        pointerEvents: 'none' as const,
        animation: 'float 7s ease-in-out infinite',
        filter: 'drop-shadow(0 4px 12px rgba(255, 214, 10, 0.3))',
      },
    },
    // Объект 2: Плоскогубцы (левый средний)
    {
      src: '/images/pliers.png',
      style: {
        position: 'fixed' as const,
        top: '40%',
        left: '4%',
        width: '110px',
        height: 'auto',
        opacity: 0.6,
        transform: 'rotate(18deg)',
        zIndex: 2,
        pointerEvents: 'none' as const,
        animation: 'float 8s ease-in-out infinite 1s',
        filter: 'drop-shadow(0 5px 14px rgba(0, 0, 0, 0.2))',
      },
    },
    // Объект 3: Рулетка (нижний правый)
    {
      src: '/images/tape-measure.png',
      style: {
        position: 'fixed' as const,
        bottom: '18%',
        right: '8%',
        width: '95px',
        height: 'auto',
        opacity: 0.55,
        transform: 'rotate(-25deg)',
        zIndex: 1,
        pointerEvents: 'none' as const,
        animation: 'float 6.5s ease-in-out infinite 0.5s',
        filter: 'drop-shadow(0 3px 10px rgba(232, 93, 47, 0.25))',
      },
    },
    // Объект 4: Карабин (верхний левый)
    {
      src: '/images/carabiner.png',
      style: {
        position: 'fixed' as const,
        top: '12%',
        left: '10%',
        width: '85px',
        height: 'auto',
        opacity: 0.5,
        transform: 'rotate(35deg)',
        zIndex: 1,
        pointerEvents: 'none' as const,
        animation: 'float 7.5s ease-in-out infinite 2s',
        filter: 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.18))',
      },
    },
    // Объект 5: Цепь (центр правый)
    {
      src: '/images/chain.png',
      style: {
        position: 'fixed' as const,
        top: '50%',
        right: '3%',
        width: '100px',
        height: 'auto',
        opacity: 0.48,
        transform: 'rotate(-15deg)',
        zIndex: 2,
        pointerEvents: 'none' as const,
        animation: 'float 9s ease-in-out infinite 1.5s',
        filter: 'drop-shadow(0 5px 12px rgba(0, 0, 0, 0.2))',
      },
    },
    // Объект 6: Бетон (нижний левый)
    {
      src: '/images/concrete-4.png',
      style: {
        position: 'fixed' as const,
        bottom: '22%',
        left: '6%',
        width: '90px',
        height: 'auto',
        opacity: 0.52,
        transform: 'rotate(28deg)',
        zIndex: 1,
        pointerEvents: 'none' as const,
        animation: 'float 8.5s ease-in-out infinite 0.8s',
        filter: 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.15))',
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
