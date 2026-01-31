export const dynamic = 'force-dynamic'

export default function SimplePage() {
  const urlFromEnv = process.env.NEXT_PUBLIC_SUPABASE_URL
  const keyFromEnv = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'monospace',
      background: '#000',
      color: '#0f0',
      minHeight: '100vh'
    }}>
      <h1>🔍 ENV Variables Test</h1>
      
      <div style={{ marginTop: '20px', padding: '10px', background: '#111' }}>
        <h2>Server Side:</h2>
        <p>URL: {urlFromEnv ? '✅ EXISTS' : '❌ MISSING'}</p>
        <p>KEY: {keyFromEnv ? '✅ EXISTS' : '❌ MISSING'}</p>
      </div>
    </div>
  )
}
