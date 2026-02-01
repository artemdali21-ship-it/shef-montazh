# Error Handling System - Quick Guide

## Setup

### 1. Wrap your app in ToastProvider

In `app/layout.tsx`:

```tsx
import { ToastProvider } from '@/components/ui/ToastProvider'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
```

## Usage

### Show Toasts

```tsx
import { useToast } from '@/components/ui/ToastProvider'

function MyComponent() {
  const toast = useToast()

  // Success
  toast.success('Операция выполнена!')

  // Error
  toast.error('Произошла ошибка')

  // Info
  toast.info('Информационное сообщение')

  // Warning
  toast.warning('Внимание!')

  // Custom duration
  toast.showToast('success', 'Message', 5000)
}
```

### Display Error State

```tsx
import ErrorState from '@/components/ui/ErrorState'

function MyComponent() {
  const [error, setError] = useState<string | null>(null)

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => loadData()}
      />
    )
  }

  return <div>Content</div>
}
```

### Handle API Errors

```tsx
import { handleApiError, tryCatch } from '@/lib/utils/errorHandler'
import { useToast } from '@/components/ui/ToastProvider'

function MyComponent() {
  const toast = useToast()

  const fetchData = async () => {
    try {
      const response = await fetch('/api/data')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      toast.success('Данные загружены!')
      return data
    } catch (error) {
      toast.error(handleApiError(error))
      return null
    }
  }

  // Or with tryCatch helper
  const fetchDataAlt = async () => {
    const [data, error] = await tryCatch(async () => {
      const response = await fetch('/api/data')
      if (!response.ok) throw new Error('Failed')
      return response.json()
    })

    if (error) {
      toast.error(handleApiError(error))
      return null
    }

    toast.success('Данные загружены!')
    return data
  }
}
```

### Handle Supabase Errors

```tsx
import { handleSupabaseError } from '@/lib/utils/errorHandler'

const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)

if (error) {
  toast.error(handleSupabaseError(error))
  return
}
```

### Retry with Exponential Backoff

```tsx
import { retryAsync } from '@/lib/utils/errorHandler'

const data = await retryAsync(
  async () => {
    const response = await fetch('/api/data')
    if (!response.ok) throw new Error('Failed')
    return response.json()
  },
  3,    // max retries
  1000  // initial delay (ms)
)
```

## Components

### ErrorState

Props:
- `title?: string` - Title (default: "Что-то пошло не так")
- `message: string` - Error message (required)
- `onRetry?: () => void` - Retry callback (shows button if provided)
- `variant?: 'default' | 'compact'` - Size variant

### Toast

Automatically managed by ToastProvider. Use `useToast()` hook.

Types:
- `success` - Green
- `error` - Red
- `warning` - Yellow
- `info` - Blue

## Utility Functions

### getErrorMessage(error: unknown): string
Extract error message from any error type.

### handleApiError(error: unknown): string
Map common HTTP errors to user-friendly messages.

### handleSupabaseError(error: any): string
Handle Supabase-specific errors.

### logError(error: unknown, context?: string): void
Log error with context (sends to Sentry in production).

### tryCatch(fn, errorMessage?): Promise<[T | null, Error | null]>
Async wrapper that returns [result, error] tuple.

### retryAsync(fn, maxRetries, delay): Promise<T>
Retry async function with exponential backoff.

### validateRequired(data, fields): { valid: boolean; missing: string[] }
Validate required fields in an object.
