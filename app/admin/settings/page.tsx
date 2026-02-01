import TwoFactorSetup from '@/components/admin/TwoFactorSetup'
import BackupManager from '@/components/admin/BackupManager'

export const dynamic = 'force-dynamic'

export default function AdminSettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Настройки безопасности</h1>
          <p className="text-gray-400">Управление безопасностью вашего аккаунта и системы</p>
        </div>

        <TwoFactorSetup />
        <BackupManager />
      </div>
    </div>
  )
}
