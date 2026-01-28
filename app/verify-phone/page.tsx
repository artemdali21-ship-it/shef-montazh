import { Suspense } from 'react'
import PhoneVerificationScreen from '@/components/PhoneVerificationScreen'

function VerifyPhoneContent() {
  return <PhoneVerificationScreen />
}

export default function VerifyPhonePage() {
  return (
    <Suspense fallback={<div style={{ backgroundColor: '#0F172A', minHeight: '100vh' }} />}>
      <VerifyPhoneContent />
    </Suspense>
  )
}
