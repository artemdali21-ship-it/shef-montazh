'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Wrench, Paintbrush, Zap, Flame, Mountain, Package, HardHat } from 'lucide-react'

const categories = [
  { id: 'montazhnik', name: 'Монтажник', icon: Wrench },
  { id: 'decorator', name: 'Декоратор', icon: Paintbrush },
  { id: 'electrik', name: 'Электрик', icon: Zap },
  { id: 'svarchik', name: 'Сварщик', icon: Flame },
  { id: 'alpinist', name: 'Альпинист', icon: Mountain },
  { id: 'butafor', name: 'Бутафор', icon: Package },
  { id: 'raznorabochiy', name: 'Разнорабочий', icon: HardHat },
]

export default function WorkerCategoriesPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string[]>([])

  const toggleCategory = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(cat => cat !== id) : [...prev, id]
    )
  }

  const handleContinue = () => {
    if (selected.length === 0) {
      alert('Выберите хотя бы одну специализацию')
      return
    }
    localStorage.setItem('workerCategories', JSON.stringify(selected))
    router.push('/feed')
  }

  return (
    <div className="h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] flex flex-col relative">
      {/* FLOATING 3D ELEMENTS - WITH POINTER EVENTS NONE SO THEY DON'T BLOCK SCROLL */}
      <div style={{ 
        position: 'fixed', 
        inset: 0, 
        pointerEvents: 'none', 
        zIndex: 2,
        overflow: 'hidden',
      }}>
        <img
          src="/images/wrench.png"
          alt=""
          style={{
            position: 'fixed',
            top: '10%',
            right: '8%',
            width: '160px',
            height: 'auto',
            opacity: 0.5,
            zIndex: 1,
            pointerEvents: 'none',
            animation: 'float 7s ease-in-out infinite',
            filter: 'drop-shadow(0 10px 30px rgba(232, 93, 47, 0.2))',
          }}
        />
        <img
          src="/images/pliers.png"
          alt=""
          style={{
            position: 'fixed',
            bottom: '20%',
            left: '8%',
            width: '140px',
            height: 'auto',
            opacity: 0.6,
            transform: 'rotate(-25deg)',
            zIndex: 1,
            pointerEvents: 'none',
            animation: 'float 8s ease-in-out infinite 0.5s',
            filter: 'drop-shadow(0 10px 30px rgba(191, 255, 0, 0.25))',
          }}
        />
        <img
          src="/images/bolts.png"
          alt=""
          style={{
            position: 'fixed',
            top: '60%',
            right: '5%',
            width: '100px',
            height: 'auto',
            opacity: 0.55,
            zIndex: 1,
            pointerEvents: 'none',
            animation: 'float 6s ease-in-out infinite 1s',
            filter: 'drop-shadow(0 4px 12px rgba(255, 214, 10, 0.25))',
          }}
        />
      </div>

      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        background: 'rgba(26, 26, 26, 0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        zIndex: 20,
        flexShrink: 0,
        height: '4rem',
      }} className="flex items-center justify-between px-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg transition-all"
        >
          <ChevronLeft className="w-5 h-5 text-white" strokeWidth={2} />
        </button>
        <h1 className="text-base font-600 text-white">Выберите специализацию</h1>
        <div className="w-10"></div>
      </header>

      {/* Content - Scrollable */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        position: 'relative',
        zIndex: 10,
        WebkitOverflowScrolling: 'touch',
        minHeight: 0,
      }}>
        <div className="px-4 py-6 pb-24">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <p className="text-white/60 text-sm font-medium">
                Можно выбрать несколько категорий
              </p>
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map(category => {
                const Icon = category.icon
                const isSelected = selected.includes(category.id)

                return (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`relative group overflow-hidden rounded-2xl transition-all active:scale-95 h-40 flex flex-col items-center justify-center gap-3 ${
                      isSelected ? 'ring-2 ring-[#E85D2F]' : ''
                    }`}
                    style={{
                      background: isSelected
                        ? 'linear-gradient(135deg, rgba(232, 93, 47, 0.2) 0%, rgba(232, 93, 47, 0.1) 100%)'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: isSelected
                        ? '1.5px solid rgba(232, 93, 47, 0.6)'
                        : '1px solid rgba(255, 255, 255, 0.15)',
                      boxShadow: isSelected
                        ? 'inset 0 1px 0 rgba(255,255,255,0.2), 0 8px 24px rgba(232, 93, 47, 0.15)'
                        : 'inset 0 1px 0 rgba(255,255,255,0.1)',
                    }}
                  >
                    {/* Content */}
                    <div className="relative flex flex-col items-center gap-2">
                      {/* Icon */}
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[#E85D2F]/40 text-[#E85D2F]'
                            : 'bg-white/10 text-white/60 group-hover:bg-white/15 group-hover:text-white/80'
                        }`}
                      >
                        <Icon size={28} strokeWidth={1.5} />
                      </div>

                      {/* Text */}
                      <span
                        className={`text-sm font-semibold text-center transition-all ${
                          isSelected ? 'text-[#E85D2F]' : 'text-white/80 group-hover:text-white'
                        }`}
                      >
                        {category.name}
                      </span>

                      {/* Checkbox */}
                      <div
                        className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[#E85D2F] border-[#E85D2F]'
                            : 'border-white/30 group-hover:border-white/50'
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Button */}
      <footer style={{
        background: 'rgba(26, 26, 26, 0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        flexShrink: 0,
        position: 'relative',
        zIndex: 30,
      }} className="px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleContinue}
            disabled={selected.length === 0}
            className={`w-full h-14 rounded-xl font-700 text-white transition-all flex items-center justify-center gap-3 ${
              selected.length === 0
                ? 'bg-white/10 text-white/50 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#E85D2F] to-[#C44A20] hover:from-[#D94D1F] hover:to-[#B33A18] active:scale-95 shadow-lg'
            }`}
          >
            <span>Продолжить</span>
            {selected.length > 0 && (
              <span className="text-xs bg-white/20 px-2.5 py-1 rounded-lg">
                {selected.length} выб.
              </span>
            )}
          </button>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(var(--rotate, 0deg)); }
          50% { transform: translateY(-20px) rotate(var(--rotate, 0deg)); }
        }
      `}</style>
    </div>
  )
}
