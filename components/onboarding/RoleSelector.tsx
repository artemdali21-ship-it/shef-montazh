import { Wrench, Briefcase, Users } from 'lucide-react'

const roles = [
  {
    id: 'worker',
    title: 'Исполнитель',
    description: 'Ищу работу на сменах',
    icon: Wrench,
    color: 'blue'
  },
  {
    id: 'client',
    title: 'Заказчик',
    description: 'Ищу специалистов',
    icon: Briefcase,
    color: 'orange'
  },
  {
    id: 'shef',
    title: 'Шеф-монтажник',
    description: 'Управляю бригадами',
    icon: Users,
    color: 'purple'
  }
]

interface Props {
  selected: string
  onSelect: (role: 'worker' | 'client' | 'shef') => void
  onNext: () => void
}

export default function RoleSelector({ selected, onSelect, onNext }: Props) {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold text-white mb-2">
        Добро пожаловать! 👋
      </h1>
      <p className="text-gray-400 mb-8">
        Выберите свою роль на платформе
      </p>

      <div className="space-y-3 mb-8">
        {roles.map((role) => {
          const Icon = role.icon
          const isSelected = selected === role.id

          return (
            <button
              key={role.id}
              onClick={() => onSelect(role.id as any)}
              className={`
                w-full p-5 rounded-2xl border-2 flex items-center gap-4
                transition-all duration-200
                ${isSelected
                  ? 'border-orange-500 bg-orange-500/10 scale-[1.02]'
                  : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                }
              `}
            >
              <div className={`
                w-14 h-14 rounded-full flex items-center justify-center
                transition-colors
                ${isSelected ? 'bg-orange-500 text-white' : 'bg-white/10 text-gray-400'}
              `}>
                <Icon size={28} />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-bold text-lg text-white mb-1">{role.title}</h3>
                <p className="text-sm text-gray-400">{role.description}</p>
              </div>
              {isSelected && (
                <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          )
        })}
      </div>

      <button
        onClick={onNext}
        className="
          w-full py-4 bg-orange-500 text-white rounded-xl
          hover:bg-orange-600 active:scale-95
          transition-all duration-200 font-bold text-lg
        "
      >
        Продолжить
      </button>
    </div>
  )
}
