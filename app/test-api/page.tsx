'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getAllUsers, createUser } from '@/lib/api'

export default function TestAPIPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  async function testConnection() {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('users').select('count')
      setResult({ 
        success: !error,
        data, 
        error: error?.message 
      })
    } catch (err: any) {
      setResult({ 
        success: false,
        error: err.message 
      })
    }
    setLoading(false)
  }

  async function testGetUsers() {
    setLoading(true)
    try {
      const { data, error } = await getAllUsers()
      setResult({ 
        success: !error,
        count: data?.length || 0,
        data, 
        error: error?.message 
      })
    } catch (err: any) {
      setResult({ 
        success: false,
        error: err.message 
      })
    }
    setLoading(false)
  }

  async function testCreateUser() {
    setLoading(true)
    try {
      const phone = '+7999' + Math.floor(1000000 + Math.random() * 9000000)
      const { data, error } = await createUser({
        phone,
        full_name: 'Тестовый Пользователь',
        role: 'worker'
      })
      setResult({ 
        success: !error,
        data, 
        error: error?.message 
      })
    } catch (err: any) {
      setResult({ 
        success: false,
        error: err.message 
      })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🧪 API Testing</h1>
          <p className="text-white/60">Тестирование подключения к Supabase</p>
        </div>
        
        <div className="grid gap-4 mb-8">
          <button
            onClick={testConnection}
            disabled={loading}
            className="bg-[#E85D2F] hover:bg-[#E85D2F]/80 text-white px-6 py-4 rounded-xl disabled:opacity-50 font-semibold text-lg transition-all shadow-lg hover:shadow-[#E85D2F]/20"
          >
            1️⃣ Test Supabase Connection
          </button>
          
          <button
            onClick={testGetUsers}
            disabled={loading}
            className="bg-[#BFFF00] hover:bg-[#BFFF00]/80 text-black px-6 py-4 rounded-xl disabled:opacity-50 font-semibold text-lg transition-all shadow-lg hover:shadow-[#BFFF00]/20"
          >
            2️⃣ Get All Users
          </button>

          <button
            onClick={testCreateUser}
            disabled={loading}
            className="bg-[#FFD60A] hover:bg-[#FFD60A]/80 text-black px-6 py-4 rounded-xl disabled:opacity-50 font-semibold text-lg transition-all shadow-lg hover:shadow-[#FFD60A]/20"
          >
            3️⃣ Create Test User
          </button>
        </div>

        {loading && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-[#E85D2F]"></div>
            <p className="text-white/60 mt-4">Loading...</p>
          </div>
        )}

        {result && !loading && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-3 h-3 rounded-full ${result.success ? 'bg-[#BFFF00]' : 'bg-red-500'}`}></div>
              <h2 className="text-xl font-bold text-white">
                {result.success ? '✅ Success' : '❌ Error'}
              </h2>
            </div>
            <pre className="text-[#BFFF00] text-sm overflow-auto max-h-96 bg-black/40 rounded-xl p-4">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
