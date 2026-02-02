'use client'

export default function GosuslugiButton() {
  const handleClick = () => {
    alert(
      'Интеграция с Госуслуги ID будет доступна в следующем обновлении.\nСейчас используйте вход по телефону.'
    )
  }

  return (
    <button
      onClick={handleClick}
      className="w-full px-4 py-3 border-2 border-blue-500/30 bg-blue-500/10 text-blue-400 font-semibold rounded-xl hover:bg-blue-500/20 transition flex items-center justify-center gap-2"
    >
      <span>🇷🇺</span>
      <span>Вход через Госуслуги ID (скоро)</span>
    </button>
  )
}
