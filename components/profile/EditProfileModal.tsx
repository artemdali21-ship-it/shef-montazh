'use client'

import { useState } from 'react'
import { X, Upload, Camera } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { useToast } from '@/components/ui/ToastProvider'

interface Props {
  user: any
  onClose: () => void
  onSave: () => void
}

export default function EditProfileModal({ user, onClose, onSave }: Props) {
  const supabase = createClient()
  const toast = useToast()

  const [formData, setFormData] = useState({
    full_name: user.full_name || '',
    bio: user.bio || '',
    phone: user.phone || ''
  })
  const [avatar, setAvatar] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Файл слишком большой. Максимум 2MB')
      return
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Неподдерживаемый формат. Используйте JPEG, PNG или WebP')
      return
    }

    setAvatar(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let avatarUrl = user.avatar_url

      // Upload avatar if changed
      if (avatar) {
        const fileExt = avatar.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `${user.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatar, {
            upsert: true
          })

        if (uploadError) {
          throw uploadError
        }

        const { data } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath)

        avatarUrl = data.publicUrl
      }

      // Update profile
      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          bio: formData.bio,
          phone: formData.phone,
          avatar_url: avatarUrl
        })
        .eq('id', user.id)

      if (error) throw error

      toast.success('Профиль обновлён!')
      onSave()
      onClose()
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error(error.message || 'Не удалось обновить профиль')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#2A2A2A] border border-white/10 rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Редактировать профиль</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-3">
              Фото профиля
            </label>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-full bg-white/5 border border-white/10 overflow-hidden">
                {avatarPreview || user.avatar_url ? (
                  <img
                    src={avatarPreview || user.avatar_url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera className="w-8 h-8 text-gray-500" />
                  </div>
                )}
              </div>
              <label className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition">
                <Upload size={18} className="text-gray-400" />
                <span className="text-sm text-white font-medium">Выбрать фото</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              JPEG, PNG или WebP. Максимум 2MB
            </p>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Полное имя
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="
                w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                text-white placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-orange-500
              "
              required
              placeholder="Введите ваше имя"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Телефон
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="
                w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                text-white placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-orange-500
              "
              placeholder="+7 (999) 123-45-67"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              О себе
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="
                w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                text-white placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-orange-500
                resize-none
              "
              placeholder="Расскажите о себе..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="
                flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl
                text-white font-medium hover:bg-white/10 transition
              "
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="
                flex-1 px-4 py-3 bg-orange-500 rounded-xl
                text-white font-medium hover:bg-orange-600
                disabled:opacity-50 disabled:cursor-not-allowed
                transition
              "
            >
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
