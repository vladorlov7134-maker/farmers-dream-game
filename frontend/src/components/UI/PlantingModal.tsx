import { X, Carrot, Wheat, Leaf } from 'lucide-react'

interface PlantingModalProps {
  isOpen: boolean
  onClose: () => void
  onPlant: (cropType: string) => void
  position: { x: number; y: number } | null
  balance: number
}

const CROP_TYPES = [
  {
    id: 'carrot',
    name: 'Морковь',
    icon: Carrot,
    price: 10,
    color: 'from-orange-400 to-orange-600',
    description: 'Быстро растет, стабильный доход',
    growthTime: '2 минуты',
    reward: 30
  },
  {
    id: 'wheat',
    name: 'Пшеница',
    icon: Wheat,
    price: 20,
    color: 'from-yellow-400 to-yellow-600',
    description: 'Дороже, но дает больше дохода',
    growthTime: '3 минуты',
    reward: 50
  },
  {
    id: 'potato',
    name: 'Картофель',
    icon: Leaf,  // Используем Leaf вместо Potato
    price: 15,
    color: 'from-purple-400 to-purple-600',
    description: 'Баланс цены и дохода',
    growthTime: '2.5 минуты',
    reward: 40
  }
]

export const PlantingModal = ({ isOpen, onClose, onPlant, position, balance }: PlantingModalProps) => {
  if (!isOpen || !position) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md animate-scale-in">
        {/* Заголовок */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">🌱 Посадить растение</h2>
            <p className="text-gray-600">Клетка: [{position.x}, {position.y}]</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Баланс */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center justify-between">
            <span className="font-medium">Ваш баланс:</span>
            <span className="text-2xl font-bold text-green-600">{balance} 💰</span>
          </div>
        </div>

        {/* Выбор растений */}
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Выберите семена:</h3>

          <div className="space-y-3">
            {CROP_TYPES.map((crop) => {
              const canAfford = balance >= crop.price
              const Icon = crop.icon

              return (
                <button
                  key={crop.id}
                  onClick={() => {
                    if (canAfford) {
                      onPlant(crop.id)
                      onClose()
                    }
                  }}
                  disabled={!canAfford}
                  className={`w-full p-4 rounded-xl border-2 transition-all ${
                    canAfford
                      ? `bg-gradient-to-r ${crop.color} text-white hover:scale-[1.02] hover:shadow-lg border-transparent`
                      : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 bg-white/20 rounded-lg mr-3">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-lg">{crop.name}</div>
                        <div className="text-sm opacity-90">{crop.description}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-xl">{crop.price} 💰</div>
                      <div className="text-sm opacity-90">
                        ⏱️ {crop.growthTime}
                      </div>
                    </div>
                  </div>

                  {!canAfford && (
                    <div className="mt-2 text-sm text-red-500">
                      ❌ Недостаточно средств
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Подсказка */}
        <div className="p-4 bg-gray-50 rounded-b-2xl border-t">
          <p className="text-sm text-gray-600 text-center">
            💡 Нажмите на растение чтобы собрать урожай
          </p>
        </div>
      </div>
    </div>
  )
}