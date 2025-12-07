import { useState } from 'react'
import { PlantingModal } from '../../components/UI/PlantingModal'

interface Tile {
  x: number
  y: number
  hasCrop: boolean
  cropType: string | null
  growthStage: number
  isReady: boolean
}

const CROP_COLORS: Record<string, string> = {
  carrot: 'bg-orange-500',
  wheat: 'bg-yellow-500',
  potato: 'bg-purple-500'
}

const CROP_NAMES: Record<string, string> = {
  carrot: '🥕 Морковь',
  wheat: '🌾 Пшеница',
  potato: '🥔 Картофель'
}

export const SimpleFarmGrid = () => {
  const [tiles, setTiles] = useState<Tile[]>(() => {
    // Создаем начальную сетку 5x5
    const initialTiles: Tile[] = []
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        initialTiles.push({
          x,
          y,
          hasCrop: false,
          cropType: null,
          growthStage: 1,
          isReady: false
        })
      }
    }
    return initialTiles
  })

  const [selectedTile, setSelectedTile] = useState<{x: number, y: number} | null>(null)
  const [showPlantModal, setShowPlantModal] = useState(false)
  const [balance, setBalance] = useState(100)
  const [notifications, setNotifications] = useState<string[]>([])

  // Обработчик клика по клетке
  const handleTileClick = (x: number, y: number) => {
    const tile = tiles.find(t => t.x === x && t.y === y)
    if (!tile) return

    if (tile.hasCrop) {
      // Клик по растению - сбор урожая
      if (tile.isReady) {
        harvestCrop(x, y)
      } else {
        addNotification(`🌱 ${CROP_NAMES[tile.cropType || 'carrot']} еще растет...`)
      }
    } else {
      // Клик по пустой клетке - посадка
      setSelectedTile({ x, y })
      setShowPlantModal(true)
    }
  }

  // Посадка растения
  const plantCrop = (cropType: string) => {
    if (!selectedTile) return

    const cropPrice = {
      carrot: 10,
      wheat: 20,
      potato: 15
    }[cropType] || 10

    // Проверяем баланс
    if (balance < cropPrice) {
      addNotification(`❌ Недостаточно средств! Нужно ${cropPrice} 💰`)
      return
    }

    // Обновляем баланс
    setBalance(prev => prev - cropPrice)

    // Обновляем клетку
    setTiles(prev => prev.map(tile =>
      tile.x === selectedTile.x && tile.y === selectedTile.y
        ? {
            ...tile,
            hasCrop: true,
            cropType,
            growthStage: 1,
            isReady: false
          }
        : tile
    ))

    addNotification(`✅ Посажена ${CROP_NAMES[cropType]} за ${cropPrice} 💰`)

    // Таймер роста (5 секунд для теста)
    setTimeout(() => {
      setTiles(prev => prev.map(tile =>
        tile.x === selectedTile.x && tile.y === selectedTile.y
          ? { ...tile, isReady: true }
          : tile
      ))
      addNotification(`🎉 ${CROP_NAMES[cropType]} готова к сбору!`)
    }, 5000)
  }

  // Сбор урожая
  const harvestCrop = (x: number, y: number) => {
    const tile = tiles.find(t => t.x === x && t.y === y)
    if (!tile) return

    const reward = {
      carrot: 30,
      wheat: 50,
      potato: 40
    }[tile.cropType || 'carrot'] || 30

    // Обновляем баланс
    setBalance(prev => prev + reward)

    // Очищаем клетку
    setTiles(prev => prev.map(t =>
      t.x === x && t.y === y
        ? {
            ...t,
            hasCrop: false,
            cropType: null,
            growthStage: 1,
            isReady: false
          }
        : t
    ))

    addNotification(`💰 Собран урожай ${CROP_NAMES[tile.cropType || 'carrot']}! +${reward} монет`)
  }

  // Добавление уведомления
  const addNotification = (message: string) => {
    setNotifications(prev => [message, ...prev.slice(0, 3)])
    setTimeout(() => {
      setNotifications(prev => prev.filter(m => m !== message))
    }, 3000)
  }

  return (
    <div className="relative">
      {/* Игровое поле */}
      <div className="relative bg-gradient-to-b from-sky-100 to-emerald-50 p-6 rounded-2xl border-2 border-farm-brown">
        <h3 className="text-xl font-bold text-center mb-6 text-green-800">
          🌱 Ваша ферма (5x5)
        </h3>

        {/* Сетка клеток */}
        <div className="grid grid-cols-5 gap-4 max-w-2xl mx-auto">
          {tiles.map((tile) => (
            <button
              key={`${tile.x}-${tile.y}`}
              onClick={() => handleTileClick(tile.x, tile.y)}
              className={`
                relative aspect-square rounded-lg transition-all duration-200
                ${tile.hasCrop
                  ? tile.isReady
                    ? 'ring-4 ring-green-500 shadow-lg transform scale-105'
                    : 'ring-2 ring-gray-300'
                  : 'bg-farm-brown hover:bg-farm-soil hover:scale-105 hover:shadow-lg'
                }
              `}
            >
              {/* Координаты клетки */}
              <div className="absolute top-1 left-1 text-xs text-white/70">
                {tile.x},{tile.y}
              </div>

              {/* Растение */}
              {tile.hasCrop && tile.cropType && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`
                    w-3/4 h-3/4 rounded-full flex items-center justify-center
                    ${CROP_COLORS[tile.cropType]}
                    ${tile.isReady ? 'animate-pulse' : ''}
                  `}>
                    <span className="text-2xl">
                      {tile.cropType === 'carrot' ? '🥕' :
                       tile.cropType === 'wheat' ? '🌾' : '🥔'}
                    </span>
                  </div>
                </div>
              )}

              {/* Плюсик для пустой клетки */}
              {!tile.hasCrop && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-3xl text-white/30">+</div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Легенда */}
        <div className="mt-8 flex justify-center gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-farm-brown rounded mr-2"></div>
            <span>Пустая клетка</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-orange-500 rounded-full mr-2"></div>
            <span>Растение</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 ring-4 ring-green-300 rounded-full mr-2"></div>
            <span>Готово к сбору</span>
          </div>
        </div>
      </div>

      {/* Уведомления */}
      <div className="mt-4 space-y-2">
        {notifications.map((msg, index) => (
          <div
            key={index}
            className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg animate-slide-in border-l-4 border-green-500"
          >
            {msg}
          </div>
        ))}
      </div>

      {/* Информация о балансе */}
      <div className="mt-6 p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl">
        <div className="flex justify-between items-center">
          <div>
            <div className="font-bold text-lg">💰 Ваш баланс</div>
            <div className="text-3xl font-bold text-green-700">{balance} монет</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Свободных клеток:</div>
            <div className="text-2xl font-bold">
              {tiles.filter(t => !t.hasCrop).length} из 25
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно посадки */}
      <PlantingModal
        isOpen={showPlantModal}
        onClose={() => setShowPlantModal(false)}
        onPlant={plantCrop}
        position={selectedTile}
        balance={balance}
      />
    </div>
  )
}