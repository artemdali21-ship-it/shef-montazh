'use client'

import { useState, useEffect } from 'react'
import { shouldShowOnboarding } from '@/components/OnboardingTour'

/**
 * Hook to manage onboarding tour state
 *
 * Usage:
 * ```tsx
 * const { showTour, completeTour, skipTour } = useOnboarding('worker')
 *
 * return (
 *   <>
 *     {showTour && (
 *       <OnboardingTour
 *         role="worker"
 *         onComplete={completeTour}
 *         onSkip={skipTour}
 *       />
 *     )}
 *     <YourPageContent />
 *   </>
 * )
 * ```
 */
export function useOnboarding(role: 'worker' | 'client') {
  const [showTour, setShowTour] = useState(false)

  useEffect(() => {
    // Check if tour should be shown
    // Delay slightly to ensure page is rendered
    const timer = setTimeout(() => {
      const shouldShow = shouldShowOnboarding(role)
      setShowTour(shouldShow)
    }, 500)

    return () => clearTimeout(timer)
  }, [role])

  const completeTour = () => {
    setShowTour(false)
    // Optionally trigger analytics event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'onboarding_completed', {
        role
      })
    }
  }

  const skipTour = () => {
    setShowTour(false)
    // Optionally trigger analytics event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'onboarding_skipped', {
        role
      })
    }
  }

  const resetTour = () => {
    localStorage.removeItem(`onboarding_${role}_completed`)
    localStorage.removeItem(`onboarding_${role}_never_show`)
    setShowTour(true)
  }

  return {
    showTour,
    completeTour,
    skipTour,
    resetTour
  }
}

/**
 * Hook to mark specific onboarding steps as completed
 * Useful for progressive onboarding (show tips as user discovers features)
 */
export function useOnboardingProgress() {
  const markStepCompleted = (stepId: string) => {
    const completed = JSON.parse(
      localStorage.getItem('onboarding_steps_completed') || '[]'
    )
    if (!completed.includes(stepId)) {
      completed.push(stepId)
      localStorage.setItem('onboarding_steps_completed', JSON.stringify(completed))
    }
  }

  const isStepCompleted = (stepId: string): boolean => {
    const completed = JSON.parse(
      localStorage.getItem('onboarding_steps_completed') || '[]'
    )
    return completed.includes(stepId)
  }

  const resetProgress = () => {
    localStorage.removeItem('onboarding_steps_completed')
  }

  return {
    markStepCompleted,
    isStepCompleted,
    resetProgress
  }
}
