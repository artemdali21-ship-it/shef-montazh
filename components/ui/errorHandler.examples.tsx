/**
 * Error Handling - Usage Examples
 *
 * This file demonstrates how to use the error handling system
 * across the application.
 */

import { useState } from 'react'
import { useToast } from './ToastProvider'
import ErrorState from './ErrorState'
import {
  handleApiError,
  handleSupabaseError,
  tryCatch,
  retryAsync,
  logError
} from '@/lib/utils/errorHandler'

// ============================================
// 1. BASIC TOAST USAGE
// ============================================
function BasicToastExample() {
  const { showToast, success, error, info, warning } = useToast()

  const handleAction = async () => {
    try {
      // Do something
      await new Promise(resolve => setTimeout(resolve, 1000))
      success('Операция выполнена успешно!')
    } catch (err) {
      error(handleApiError(err))
    }
  }

  return (
    <div className="space-y-2">
      <button onClick={() => success('Успех!')}>Show Success</button>
      <button onClick={() => error('Ошибка!')}>Show Error</button>
      <button onClick={() => info('Информация')}>Show Info</button>
      <button onClick={() => warning('Предупреждение')}>Show Warning</button>
    </div>
  )
}

// ============================================
// 2. ERROR STATE WITH RETRY
// ============================================
function ErrorStateExample() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      // Fetch data
      await new Promise((_, reject) => setTimeout(() => reject('Network error'), 1000))
    } catch (err) {
      setError(handleApiError(err))
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={loadData}
      />
    )
  }

  return <div>Content</div>
}

// ============================================
// 3. API CALL WITH ERROR HANDLING
// ============================================
function ApiCallExample() {
  const toast = useToast()

  const createShift = async (data: any) => {
    const [result, error] = await tryCatch(async () => {
      const response = await fetch('/api/shifts', {
        method: 'POST',
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      return response.json()
    })

    if (error) {
      toast.error(handleApiError(error))
      logError(error, 'createShift')
      return null
    }

    toast.success('Смена создана!')
    return result
  }

  return <button onClick={() => createShift({ title: 'Test' })}>Create Shift</button>
}

// ============================================
// 4. SUPABASE ERROR HANDLING
// ============================================
function SupabaseExample() {
  const toast = useToast()

  const loadUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (err) {
      const message = handleSupabaseError(err)
      toast.error(message)
      logError(err, 'loadUser')
      return null
    }
  }

  return <div>Example</div>
}

// ============================================
// 5. RETRY WITH EXPONENTIAL BACKOFF
// ============================================
function RetryExample() {
  const toast = useToast()

  const fetchWithRetry = async () => {
    try {
      const data = await retryAsync(
        async () => {
          const response = await fetch('/api/data')
          if (!response.ok) throw new Error('Failed to fetch')
          return response.json()
        },
        3, // max retries
        1000 // initial delay (ms)
      )

      toast.success('Данные загружены')
      return data
    } catch (err) {
      toast.error('Не удалось загрузить данные после нескольких попыток')
      logError(err, 'fetchWithRetry')
      return null
    }
  }

  return <button onClick={fetchWithRetry}>Fetch with Retry</button>
}

// ============================================
// 6. FORM SUBMISSION WITH ERROR HANDLING
// ============================================
function FormExample() {
  const toast = useToast()
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSubmitting(true)

      // Validate
      const formData = new FormData(e.target as HTMLFormElement)
      const data = Object.fromEntries(formData)

      if (!data.name) {
        toast.warning('Заполните все обязательные поля')
        return
      }

      // Submit
      const response = await fetch('/api/submit', {
        method: 'POST',
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Submission failed')
      }

      toast.success('Форма отправлена!')
    } catch (err) {
      toast.error(handleApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" />
      <button type="submit" disabled={submitting}>
        {submitting ? 'Отправка...' : 'Отправить'}
      </button>
    </form>
  )
}

// ============================================
// 7. GLOBAL ERROR BOUNDARY (for React)
// ============================================
import { Component, ReactNode } from 'react'

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    logError(error, 'ErrorBoundary')
    console.error('Error info:', errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorState
          title="Произошла ошибка"
          message={this.state.error?.message || 'Что-то пошло не так'}
          onRetry={() => this.setState({ hasError: false, error: null })}
        />
      )
    }

    return this.props.children
  }
}

export {
  BasicToastExample,
  ErrorStateExample,
  ApiCallExample,
  SupabaseExample,
  RetryExample,
  FormExample,
  ErrorBoundary
}
