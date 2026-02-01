'use client'

import { useState, useRef } from 'react'
import { Camera, X, Check } from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'

interface CheckInFormProps {
  onSubmit: (photo: File) => Promise<void>
  disabled?: boolean
}

export default function CheckInForm({ onSubmit, disabled = false }: CheckInFormProps) {
  const toast = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('Поддерживаются только JPEG, PNG и WebP')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Файл слишком большой. Максимум 5MB')
      return
    }

    setPhoto(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemovePhoto = () => {
    setPhoto(null)
    setPhotoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async () => {
    if (!photo) {
      toast.error('Необходимо загрузить фото с объекта')
      return
    }

    try {
      setSubmitting(true)
      await onSubmit(photo)
    } catch (error: any) {
      console.error('Submit error:', error)
      toast.error(error.message || 'Произошла ошибка')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Photo Upload */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Camera className="w-5 h-5 text-orange-400" />
          Фото с объекта
        </h3>

        {!photoPreview ? (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              onChange={handlePhotoSelect}
              disabled={disabled}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="w-full h-48 bg-white/5 border-2 border-dashed border-white/20 rounded-xl hover:bg-white/10 hover:border-orange-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition flex flex-col items-center justify-center gap-3"
            >
              <Camera className="w-12 h-12 text-gray-400" />
              <p className="text-gray-300 font-medium">Сделать фото</p>
              <p className="text-xs text-gray-500">JPEG, PNG или WebP • до 5MB</p>
            </button>
          </div>
        ) : (
          <div className="relative">
            <img
              src={photoPreview}
              alt="Preview"
              className="w-full h-64 object-cover rounded-xl"
            />
            <button
              onClick={handleRemovePhoto}
              disabled={disabled}
              className="absolute top-2 right-2 w-8 h-8 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        )}

        <p className="text-xs text-gray-500 mt-4">
          📸 Сделайте фото, подтверждающее ваше присутствие на объекте
        </p>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!photo || disabled || submitting}
        className="w-full py-4 bg-orange-500 hover:bg-orange-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 transition-all rounded-xl flex items-center justify-center gap-2 text-white font-bold text-lg"
      >
        {submitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Отправка...
          </>
        ) : (
          <>
            <Check className="w-5 h-5" />
            Подтвердить check-in
          </>
        )}
      </button>
    </div>
  )
}
