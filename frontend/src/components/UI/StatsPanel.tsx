import { BarChart3, Sprout, Package, Clock } from 'lucide-react'

export const StatsPanel = () => {
  const stats = [
    { icon: Sprout, label: 'Активных посадок', value: 0, color: 'text-green-500' },
    { icon: Package, label: 'Свободных клеток', value: 25, color: 'text-blue-500' },
    { icon: Clock, label: 'Урожай через', value: '0:00', color: 'text-yellow-500' },
  ]

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-green-100">
      <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
        <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
        Статистика фермы
      </h3>

      <div className="space-y-4">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center">
              <stat.icon className={`w-5 h-5 mr-3 ${stat.color}`} />
              <span className="text-sm font-medium text-gray-700">{stat.label}</span>
            </div>
            <div className={`text-lg font-bold ${stat.color}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Прогресс уровня</span>
            <span className="font-bold text-green-600">0%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500" style={{ width: '0%' }}></div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <div className="text-xs text-gray-500">
            Заработано сегодня: <span className="font-bold text-green-600">0 💰</span>
          </div>
        </div>
      </div>
    </div>
  )
}