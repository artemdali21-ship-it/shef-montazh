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
    <div style={{
      minHeight: '100vh',
      backgroundImage: 'url(/images/bg-dashboard.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundColor: '#0F172A',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <header style={{
        position: 'relative',
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

      {/* Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        position: 'relative',
        zIndex: 10,
      }} className="px-4 py-6">
        <div className="max-w-2xl mx-auto pb-32">
          <div className="mb-6">
            <p className="text-white/60 text-sm font-medium">
              Можно выбрать несколько категорий
            </p>
          </div>

          {/* Category Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                >
                  {/* Background with glassmorphism */}
                  <div
                    className={`absolute inset-0 transition-all ${
                      isSelected
                        ? 'bg-white/10 backdrop-blur-lg'
                        : 'bg-white/5 backdrop-blur-md group-hover:bg-white/8'
                    }`}
                    style={{
                      backgroundColor: isSelected
                        ? 'rgba(232, 93, 47, 0.15)'
                        : 'rgba(255, 255, 255, 0.05)',
                    }}
                  />

                  {/* Border */}
                  <div
                    className={`absolute inset-0 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-[#E85D2F]'
                        : 'border-white/20 group-hover:border-white/30'
                    }`}
                  />

                  {/* Content */}
                  <div className="relative flex flex-col items-center gap-2">
                    {/* Icon */}
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-[#E85D2F]/30 text-[#E85D2F]'
                          : 'bg-white/10 text-white/60 group-hover:bg-white/15'
                      }`}
                    >
                      <Icon size={28} strokeWidth={1.5} />
                    </div>

                    {/* Text */}
                    <span
                      className={`text-sm font-semibold text-center transition-all ${
                        isSelected ? 'text-[#E85D2F]' : 'text-white/80'
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

      {/* Footer Button */}
      <footer style={{
        background: 'rgba(26, 26, 26, 0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        flexShrink: 0,
      }} className="px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleContinue}
            disabled={selected.length === 0}
            className={`w-full h-14 rounded-xl font-700 text-white transition-all flex items-center justify-center gap-2 ${
              selected.length === 0
                ? 'bg-white/10 text-white/50 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#E85D2F] to-[#C44A20] hover:from-[#D94D1F] hover:to-[#B33A18] active:scale-95 shadow-lg'
            }`}
          >
            Продолжить
            {selected.length > 0 && (
              <span className="text-xs bg-white/20 px-2 py-1 rounded-lg ml-auto">
                {selected.length} выб.
              </span>
            )}
          </button>
        </div>
      </footer>
    </div>
  )
}
