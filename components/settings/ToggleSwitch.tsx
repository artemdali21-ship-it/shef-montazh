interface Props {
  enabled: boolean
  onChange: (enabled: boolean) => void
  label: string
  disabled?: boolean
}

export default function ToggleSwitch({ enabled, onChange, label, disabled }: Props) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-white">{label}</span>
      <button
        onClick={() => !disabled && onChange(!enabled)}
        disabled={disabled}
        className={`
          relative w-12 h-6 rounded-full transition-colors
          ${enabled ? 'bg-orange-500' : 'bg-white/10'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <div
          className={`
            absolute top-1 left-1 w-4 h-4 bg-white rounded-full
            transition-transform duration-200
            ${enabled ? 'translate-x-6' : ''}
          `}
        />
      </button>
    </div>
  )
}
