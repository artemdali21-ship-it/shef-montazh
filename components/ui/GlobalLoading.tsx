'use client'

import { useEffect, useState } from 'use client'

interface GlobalLoadingProps {
  show: boolean
  message?: string
}

export default function GlobalLoading({ show, message = 'Загрузка...' }: GlobalLoadingProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
    } else {
      // Delay hiding to prevent flicker on fast operations
      const timer = setTimeout(() => setIsVisible(false), 200)
      return () => clearTimeout(timer)
    }
  }, [show])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 shadow-2xl flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
        <p className="text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  )
}

// Progress Loading for multi-step operations
export function ProgressLoading({ steps, currentStep }: { steps: string[], currentStep: number }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 shadow-2xl max-w-md w-full mx-4">
        <div className="mb-6">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
        </div>

        <div className="space-y-2">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-2 rounded ${
                index === currentStep
                  ? 'bg-blue-50 text-blue-900 font-medium'
                  : index < currentStep
                  ? 'text-green-600'
                  : 'text-gray-400'
              }`}
            >
              {index < currentStep && <span>✓</span>}
              {index === currentStep && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              )}
              {index > currentStep && <span className="w-4"></span>}
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
