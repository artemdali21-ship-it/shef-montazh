'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Search, Inbox } from 'lucide-react'
import DocumentCard from '@/components/documents/DocumentCard'
import DocumentFilters from '@/components/documents/DocumentFilters'
import EmptyState from '@/components/ui/EmptyState'
import { SkeletonDocumentList } from '@/components/ui/SkeletonDocument'
import { createClient } from '@/lib/supabase-client'

interface Document {
  id: string
  type: 'act' | 'receipt' | 'contract'
  title: string
  file_url: string | null
  created_at: string
  shift_id: string | null
}

export default function WorkerDocumentsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [documents, setDocuments] = useState<Document[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedPeriod, setSelectedPeriod] = useState('all')

  useEffect(() => {
    loadDocuments()
  }, [])

  useEffect(() => {
    filterDocuments()
  }, [documents, searchQuery, selectedType, selectedPeriod])

  const loadDocuments = async () => {
    try {
      setLoading(true)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Load documents
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading documents:', error)
        return
      }

      setDocuments(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterDocuments = () => {
    let filtered = [...documents]

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(doc => doc.type === selectedType)
    }

    // Filter by period
    if (selectedPeriod !== 'all') {
      const now = new Date()
      const periodDays = {
        week: 7,
        month: 30,
        quarter: 90,
        year: 365
      }[selectedPeriod] || 0

      if (periodDays > 0) {
        const cutoffDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000)
        filtered = filtered.filter(doc => new Date(doc.created_at) >= cutoffDate)
      }
    }

    setFilteredDocuments(filtered)
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-white/10 backdrop-blur-xl border-b border-white/20 z-20">
        <div className="p-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Документы</h1>
            {!loading && (
              <p className="text-sm text-gray-400">
                {filteredDocuments.length} {filteredDocuments.length === 1 ? 'документ' : 'документов'}
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию смены..."
            className="
              w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl
              text-white placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-orange-500
            "
          />
        </div>

        {/* Filters */}
        <DocumentFilters
          selectedType={selectedType}
          selectedPeriod={selectedPeriod}
          onTypeChange={setSelectedType}
          onPeriodChange={setSelectedPeriod}
        />

        {/* Documents Grid */}
        {loading ? (
          <SkeletonDocumentList count={6} />
        ) : filteredDocuments.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title={searchQuery || selectedType !== 'all' || selectedPeriod !== 'all'
              ? 'Документы не найдены'
              : 'Нет документов'}
            description={searchQuery || selectedType !== 'all' || selectedPeriod !== 'all'
              ? 'Попробуйте изменить параметры поиска'
              : 'Документы будут появляться здесь после завершения смен'}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDocuments.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
