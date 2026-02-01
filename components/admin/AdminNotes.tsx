'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, StickyNote, Loader2, User } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { useToast } from '@/components/ui/ToastProvider'

interface Note {
  id: string
  note: string
  created_at: string
  admin: {
    id: string
    full_name: string
    avatar_url: string | null
  } | null
}

interface Props {
  userId: string
}

export default function AdminNotes({ userId }: Props) {
  const supabase = createClient()
  const toast = useToast()

  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    loadNotes()
  }, [userId])

  const loadNotes = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('admin_notes')
        .select(`
          *,
          admin:admin_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      setNotes(data || [])
    } catch (error: any) {
      console.error('Load notes error:', error)
      toast.error('Ошибка загрузки заметок')
    } finally {
      setLoading(false)
    }
  }

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newNote.trim()) {
      toast.error('Введите текст заметки')
      return
    }

    setSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Необходима авторизация')
        return
      }

      const { error } = await supabase
        .from('admin_notes')
        .insert({
          user_id: userId,
          admin_id: user.id,
          note: newNote.trim()
        })

      if (error) throw error

      toast.success('Заметка добавлена')
      setNewNote('')
      await loadNotes()
    } catch (error: any) {
      console.error('Add note error:', error)
      toast.error(error.message || 'Ошибка при добавлении заметки')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteNote = async (noteId: string) => {
    if (!confirm('Удалить заметку?')) return

    setDeleting(noteId)

    try {
      const { error } = await supabase
        .from('admin_notes')
        .delete()
        .eq('id', noteId)

      if (error) throw error

      toast.success('Заметка удалена')
      await loadNotes()
    } catch (error: any) {
      console.error('Delete note error:', error)
      toast.error('Ошибка при удалении заметки')
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-center h-32">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <StickyNote size={24} className="text-orange-400" />
        <h3 className="text-xl font-semibold text-white">
          Заметки админа
        </h3>
        {notes.length > 0 && (
          <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-lg text-sm font-medium">
            {notes.length}
          </span>
        )}
      </div>

      {/* Add Note Form */}
      <form onSubmit={addNote} className="mb-6">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Добавить заметку о пользователе..."
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
          rows={3}
          maxLength={1000}
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-sm text-gray-400">
            {newNote.length}/1000
          </span>
          <button
            type="submit"
            disabled={submitting || !newNote.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Добавление...
              </>
            ) : (
              <>
                <Plus size={16} />
                Добавить заметку
              </>
            )}
          </button>
        </div>
      </form>

      {/* Notes List */}
      <div className="space-y-3">
        {notes.length > 0 ? (
          notes.map((note) => (
            <div
              key={note.id}
              className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {note.admin ? (
                    <>
                      {note.admin.avatar_url ? (
                        <img
                          src={note.admin.avatar_url}
                          alt={note.admin.full_name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-sm font-semibold">
                          {note.admin.full_name[0]}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-white">
                          {note.admin.full_name}
                        </div>
                        <div className="text-sm text-gray-400">
                          {new Date(note.created_at).toLocaleString('ru-RU', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-500" />
                      <span className="text-gray-400 text-sm">Удалённый админ</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => deleteNote(note.id)}
                  disabled={deleting === note.id}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition disabled:opacity-50"
                  title="Удалить заметку"
                >
                  {deleting === note.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>
              <p className="text-gray-300 whitespace-pre-wrap">{note.note}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <StickyNote size={48} className="mx-auto text-gray-600 mb-3" />
            <p className="text-gray-400">Заметок пока нет</p>
            <p className="text-sm text-gray-500 mt-1">
              Добавьте первую заметку о пользователе
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
