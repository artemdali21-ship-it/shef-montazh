'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'

interface WorkerPortfolioProps {
  workerId: string
  isEditable?: boolean
}

interface Project {
  id: string
  title: string
  role: string
  city: string
  project_date: string
  image_url?: string
}

export default function WorkerPortfolio({ workerId, isEditable = false }: WorkerPortfolioProps) {
  const supabase = createClient()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProjects()
  }, [workerId])

  const loadProjects = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('worker_projects')
      .select('*')
      .eq('worker_id', workerId)
      .order('project_date', { ascending: false })
      .limit(5)

    if (data) setProjects(data)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
        <p className="text-gray-400 text-sm">Загрузка портфолио...</p>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
        <h3 className="font-semibold text-white mb-2">Портфолио</h3>
        <p className="text-gray-400 text-sm">Пока нет проектов</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-white">Портфолио</h3>
      <div className="grid grid-cols-2 gap-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden hover:bg-white/10 transition"
          >
            {project.image_url && (
              <img
                src={project.image_url}
                alt={project.title}
                className="w-full h-32 object-cover"
              />
            )}
            {!project.image_url && (
              <div className="w-full h-32 bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center">
                <span className="text-4xl">📸</span>
              </div>
            )}
            <div className="p-2 bg-white/5">
              <p className="font-medium text-sm text-white truncate">{project.title}</p>
              <p className="text-xs text-gray-400 truncate">
                {project.role} • {project.city}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(project.project_date).toLocaleDateString('ru-RU')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
