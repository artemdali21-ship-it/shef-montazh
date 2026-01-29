import { Suspense } from 'react'
import PhoneVerificationScreen from '@/components/PhoneVerificationScreen'

function VerifyPhoneContent() {
  return <PhoneVerificationScreen />
}

export default function VerifyPhonePage() {
  return (
    <div className="h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] overflow-hidden">
      <Suspense fallback={<div className="w-screen h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A]" />}>
        <VerifyPhoneContent />
      </Suspense>
    </div>
  )
}
