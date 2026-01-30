'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  User, Phone, FileText, Briefcase, Award, Building,
  Hash, Save, X, AlertCircle, CheckCircle, Upload, Camera,
  Wrench, Paintbrush, Zap, Flame, Mountain, Package, HardHat
} from 'lucide-react'
import {
  getCurrentUserProfile,
  updateUserProfile,
  updateWorkerProfile,
  updateClientProfile,
  uploadAvatar,
} from '@/lib/api/profile'

const workerCategories = [
  { id: 'montazhnik', name: 'Монтажник', icon: Wrench },
  { id: 'decorator', name: 'Декоратор', icon: Paintbrush },
  { id: 'electrik', name: 'Электрик', icon: Zap },
  { id: 'svarchik', name: 'Сварщик', icon: Flame },
  { id: 'alpinist', name: 'Альпинист', icon: Mountain },
  { id: 'butafor', name: 'Бутафор', icon: Package },
  { id: 'raznorabochiy', name: 'Разнорабочий', icon: HardHat },
]

type Role = 'worker' | 'client' | 'shef'

export default function EditProfilePage() {
  const router = useRouter()

  // Mock user ID - in production, get from auth context
  const MOCK_USER_ID = 'worker-123'

  // User state
  const [role, setRole] = useState<Role>('worker')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form fields - User
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')

  // Form fields - Worker
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [experienceYears, setExperienceYears] = useState('')

  // Form fields - Client
  const [companyName, setCompanyName] = useState('')
  const [companyInn, setCompanyInn] = useState('')

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load user profile with role-specific data
      const { data, error: profileError } = await getCurrentUserProfile(MOCK_USER_ID)
      if (profileError) throw profileError
      if (!data) throw new Error('Пользователь не найден')

      // Set user fields
      setFullName(data.full_name || '')
      setPhone(data.phone || '')
      setAvatarUrl(data.avatar_url || '')
      setRole(data.role as Role)

      // Load role-specific data
      if (data.role === 'worker' && data.profile) {
        setBio(data.profile.bio || '')
        setSelectedCategories(data.profile.categories || [])
        setExperienceYears(data.profile.experience_years?.toString() || '0')
      } else if (data.role === 'client' && data.profile) {
        setCompanyName(data.profile.company_name || '')
        setCompanyInn(data.profile.company_inn || '')
      }
    } catch (err: any) {
      console.error('Error loading user data:', err)
      setError('Не удалось загрузить данные профиля')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    if (!fullName.trim()) {
      setError('Введите имя')
      return false
    }

    if (!phone.trim()) {
      setError('Введите номер телефона')
      return false
    }

    // Phone format validation (basic)
    const phoneRegex = /^[\d\s\+\-\(\)]+$/
    if (!phoneRegex.test(phone)) {
      setError('Некорректный формат телефона')
      return false
    }

    // Worker-specific validation
    if (role === 'worker' && selectedCategories.length === 0) {
      setError('Выберите хотя бы одну категорию')
      return false
    }

    return true
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Пожалуйста, выберите изображение')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Размер файла не должен превышать 5 МБ')
        return
      }

      setAvatarFile(file)
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setAvatarUrl(previewUrl)
    }
  }

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleSave = async () => {
    setError(null)

    if (!validateForm()) {
      return
    }

    try {
      setSaving(true)

      let uploadedAvatarUrl = avatarUrl

      // Upload avatar if changed
      if (avatarFile) {
        const { data: avatarUrlData, error: uploadError } = await uploadAvatar(
          MOCK_USER_ID,
          avatarFile
        )

        if (uploadError) {
          throw new Error('Не удалось загрузить аватар')
        }

        if (avatarUrlData) {
          uploadedAvatarUrl = avatarUrlData
        }
      }

      // Update user profile
      const { error: userError } = await updateUserProfile(MOCK_USER_ID, {
        full_name: fullName.trim(),
        phone: phone.trim(),
        avatar_url: uploadedAvatarUrl || undefined,
      })

      if (userError) throw userError

      // Update role-specific profile
      if (role === 'worker') {
        const { error: workerError } = await updateWorkerProfile(MOCK_USER_ID, {
          bio: bio.trim() || undefined,
          categories: selectedCategories,
        })

        if (workerError) throw workerError
      } else if (role === 'client') {
        const { error: clientError } = await updateClientProfile(MOCK_USER_ID, {
          company_name: companyName.trim() || undefined,
        })

        if (clientError) throw clientError
      }

      setSuccess(true)

      // Redirect after success
      setTimeout(() => {
        if (role === 'worker') {
          router.push('/profile/worker')
        } else {
          router.push('/dashboard')
        }
      }, 1500)
    } catch (err: any) {
      console.error('Error updating profile:', err)
      setError(err.message || 'Ошибка сохранения. Попробуйте снова.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (role === 'worker') {
      router.push('/profile/worker')
    } else {
      router.push('/dashboard')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A] flex items-center justify-center p-4">
        <div className="bg-green-500/10 backdrop-blur-xl rounded-2xl border border-green-500/30 p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Профиль обновлен!</h2>
          <p className="text-gray-300">Перенаправление...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A] pb-8">
      {/* Header */}
      <div className="sticky top-0 bg-[#2A2A2A]/80 backdrop-blur-xl border-b border-white/10 z-10">
        <div className="p-4">
          <h1 className="text-xl font-bold text-white text-center">Редактировать профиль</h1>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-4">
        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Avatar Upload */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center overflow-hidden border-4 border-white/20">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-white" />
                )}
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-600 transition border-4 border-[#2A2A2A]"
              >
                <Camera className="w-5 h-5 text-white" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={saving}
                />
              </label>
            </div>
            <p className="text-sm text-gray-400">Нажмите на камеру для загрузки фото</p>
            <p className="text-xs text-gray-500 mt-1">Максимум 5 МБ, форматы: JPG, PNG</p>
          </div>
        </div>

        {/* Full Name */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
          <label htmlFor="fullName" className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-orange-400" />
            Полное имя *
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Иван Петров"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
            disabled={saving}
          />
        </div>

        {/* Phone */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
          <label htmlFor="phone" className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
            <Phone className="w-4 h-4 text-orange-400" />
            Телефон *
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+7 (999) 123-45-67"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
            disabled={saving}
          />
        </div>

        {/* Worker-specific fields */}
        {role === 'worker' && (
          <>
            {/* Bio */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
              <label htmlFor="bio" className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-400" />
                О себе
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Расскажите о себе и своём опыте..."
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition resize-none"
                disabled={saving}
              />
            </div>

            {/* Categories */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
              <label className="block text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-orange-400" />
                Категории *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {workerCategories.map((category) => {
                  const Icon = category.icon
                  const isSelected = selectedCategories.includes(category.id)

                  return (
                    <label
                      key={category.id}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition ${
                        isSelected
                          ? 'bg-orange-500/20 border-orange-500/50'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-orange-400' : 'text-gray-400'}`} />
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCategory(category.id)}
                        disabled={saving}
                        className="w-5 h-5 rounded border-white/20 bg-white/5 text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-white text-sm font-medium">{category.name}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Experience Years */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
              <label htmlFor="experienceYears" className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <Award className="w-4 h-4 text-orange-400" />
                Опыт работы (лет)
              </label>
              <input
                id="experienceYears"
                type="number"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                placeholder="5"
                min="0"
                max="50"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                disabled={saving}
              />
            </div>
          </>
        )}

        {/* Client-specific fields */}
        {role === 'client' && (
          <>
            {/* Company Name */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
              <label htmlFor="companyName" className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <Building className="w-4 h-4 text-orange-400" />
                Название компании
              </label>
              <input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="ООО «Пример»"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                disabled={saving}
              />
            </div>

            {/* Company INN */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
              <label htmlFor="companyInn" className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <Hash className="w-4 h-4 text-orange-400" />
                ИНН компании
              </label>
              <input
                id="companyInn"
                type="text"
                value={companyInn}
                onChange={(e) => setCompanyInn(e.target.value)}
                placeholder="1234567890"
                maxLength={12}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                disabled={saving}
              />
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            disabled={saving}
            className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" />
            Отмена
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 disabled:cursor-not-allowed rounded-xl text-white font-bold transition shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Сохранение...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Сохранить
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
