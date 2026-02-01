'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { useToast } from '@/components/ui/ToastProvider'
import { Loader2 } from 'lucide-react'

export default function CreateTeamForm() {
  const router = useRouter()
  const toast = useToast()
  const supabase = createClient()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Введите название бригады')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Необходима авторизация')
        router.push('/auth/login')
        return
      }

      const { data, error } = await supabase
        .from('teams')
        .insert({
          shef_id: user.id,
          name: name.trim(),
          description: description.trim() || null
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Бригада создана!')
      router.push(`/shef/teams/${data.id}`)
    } catch (error: any) {
      console.error('Team creation error:', error)
      toast.error(error.message || 'Ошибка при создании бригады')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Название бригады
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Например: Основная бригада"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
          required
          disabled={loading}
          maxLength={100}
        />
        <p className="text-xs text-gray-500 mt-1">{name.length}/100</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Описание (необязательно)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Краткое описание бригады..."
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
          rows={4}
          disabled={loading}
          maxLength={500}
        />
        <p className="text-xs text-gray-500 mt-1">{description.length}/500</p>
      </div>

      <button
        type="submit"
        disabled={loading || !name.trim()}
        className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Создание...
          </>
        ) : (
          'Создать бригаду'
        )}
      </button>
    </form>
  )
}
