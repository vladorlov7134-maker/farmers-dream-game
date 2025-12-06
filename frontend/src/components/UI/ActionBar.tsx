import { Sprout, Store, Settings, HelpCircle, RefreshCw } from 'lucide-react'

export const ActionBar = () => {
  const actions = [
    {
      icon: Sprout,
      label: 'Посадить',
      color: 'bg-green-500 hover:bg-green-600',
      onClick: () => alert('Выберите семена для посадки!')
    },
    {
      icon: Store,
      label: 'Магазин',
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => alert('Магазин семян и улучшений')
    },
    {
      icon: RefreshCw,
      label: 'Собрать',
      color: 'bg-yellow-500 hover:bg-yellow-600',
      onClick: () => alert('Сбор урожая')
    },
    {
      icon: Settings,
      label: 'Настройки',
      color: 'bg-gray-500 hover:bg-gray-600',
      onClick: () => alert('Настройки игры')
    },
    {
      icon: HelpCircle,
      label: 'Помощь',
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => alert('Помощь по игре')
    },
  ]

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-10">
      <div className="flex gap-2 bg-black/30 backdrop-blur-md p-2 rounded-2xl shadow-2xl">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`${action.color} text-white p-3 rounded-xl flex flex-col items-center transition-all hover:scale-105 active:scale-95 min-w-[70px]`}
          >
            <action.icon className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}