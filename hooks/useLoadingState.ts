'use client'

import { useState, useCallback } from 'react'

interface LoadingState {
  isLoading: boolean
  error: string | null
  success: boolean
}

export function useLoadingState(initialLoading: boolean = false) {
  const [state, setState] = useState<LoadingState>({
    isLoading: initialLoading,
    error: null,
    success: false
  })

  const startLoading = useCallback(() => {
    setState({ isLoading: true, error: null, success: false })
  }, [])

  const setError = useCallback((error: string) => {
    setState({ isLoading: false, error, success: false })
  }, [])

  const setSuccess = useCallback(() => {
    setState({ isLoading: false, error: null, success: true })
  }, [])

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null, success: false })
  }, [])

  /**
   * Wrap an async function with loading state management
   */
  const execute = useCallback(async <T,>(
    fn: () => Promise<T>,
    options?: {
      onSuccess?: (result: T) => void
      onError?: (error: Error) => void
      successMessage?: string
    }
  ): Promise<T | null> => {
    startLoading()
    try {
      const result = await fn()
      setSuccess()
      options?.onSuccess?.(result)
      return result
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred'
      setError(errorMessage)
      options?.onError?.(error)
      return null
    }
  }, [startLoading, setError, setSuccess])

  return {
    ...state,
    startLoading,
    setError,
    setSuccess,
    reset,
    execute
  }
}
