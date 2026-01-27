'use client'

export function HeroCard() {
  return (
    <div className="mb-10 rounded-3xl overflow-hidden relative aspect-video shadow-sm">
      {/* Photo */}
      <img
        src="/hero-construction.svg"
        alt="Construction workers"
        className="w-full h-full object-cover"
        style={{ filter: 'saturate(0.9)' }}
      />
      
      {/* Glass Overlay */}
      <div 
        className="absolute bottom-0 left-0 right-0 rounded-b-3xl p-6"
        style={{
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(16px)',
          borderTop: '0.5px solid rgba(255, 255, 255, 0.4)',
        }}
      >
        <h2 className="text-xl font-semibold text-foreground mb-2 leading-tight">
          Гарантированный выход бригады
        </h2>
        <p className="text-sm font-normal text-secondary leading-relaxed">
          Эскроу-оплата, проверенные специалисты, страхование смен
        </p>
      </div>
    </div>
  )
}
