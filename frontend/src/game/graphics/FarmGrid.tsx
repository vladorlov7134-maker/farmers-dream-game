import { useEffect, useRef, useState } from 'react'
import { PlantingModal } from '../../components/UI/PlantingModal'

interface Tile {
  x: number
  y: number
  hasCrop: boolean
  cropType: string | null
  growthStage: number
  plantedAt: string | null
  isReady: boolean
}

export const FarmGrid = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [tiles, setTiles] = useState<Tile[]>([])
  const [selectedTile, setSelectedTile] = useState<{x: number, y: number} | null>(null)
  const [showPlantModal, setShowPlantModal] = useState(false)
  const [balance, setBalance] = useState(100)
  const [notifications, setNotifications] = useState<string[]>([])

  // Инициализация поля 5x5
  useEffect(() => {
    const initialTiles: Tile[] = []
    const gridSize = 5

    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        initialTiles.push({
          x,
          y,
          hasCrop: false,
          cropType: null,
          growthStage: 1,
          plantedAt: null,
          isReady: false
        })
      }
    }

    setTiles(initialTiles)
  }, [])

  // Обработчик клика по клетке
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const tileSize = 90
    const gridX = Math.floor((x - 50) / tileSize)
    const gridY = Math.floor((y - 50) / tileSize)

    if (gridX >= 0 && gridX < 5 && gridY >= 0 && gridY < 5) {
      const tile = tiles.find(t => t.x === gridX && t.y === gridY)

      if (!tile) return

      if (tile.hasCrop) {
        // Клик по растению - сбор урожая
        if (tile.isReady) {
          harvestCrop(gridX, gridY)
        } else {
          addNotification(`🌱 Растение еще растет...`)
        }
      } else {
        // Клик по пустой клетке - посадка
        setSelectedTile({ x: gridX, y: gridY })
        setShowPlantModal(true)
      }
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
            plantedAt: new Date().toISOString(),
            isReady: false
          }
        : tile
    ))

    // Уведомление
    const cropName = {
      carrot: 'морковь',
      wheat: 'пшеницу',
      potato: 'картофель'
    }[cropType] || 'растение'

    addNotification(`✅ Посажена ${cropName} за ${cropPrice} 💰`)

    // Таймер роста
    setTimeout(() => {
      setTiles(prev => prev.map(tile =>
        tile.x === selectedTile.x && tile.y === selectedTile.y
          ? { ...tile, isReady: true }
          : tile
      ))
      addNotification(`🎉 Урожай готов к сбору!`)
    }, 5000) // 5 секунд для теста (в реальной игре 2-3 минуты)
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
            plantedAt: null,
            isReady: false
          }
        : t
    ))

    addNotification(`💰 Собран урожай! +${reward} монет`)
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
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full h-auto border-3 border-farm-brown rounded-xl bg-gradient-to-b from-sky-100 to-emerald-50 cursor-pointer shadow-lg"
          onClick={handleCanvasClick}
        />

        {/* Блок с информацией */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg">
          <div className="text-lg font-bold mb-2">🎮 Управление</div>
          <div className="space-y-1 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-farm-brown mr-2"></div>
              <span>Пустая клетка - клик для посадки</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-orange-400 rounded-full mr-2"></div>
              <span>Растение - клик для сбора</span>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              Баланс: <span className="font-bold text-green-600">{balance} 💰</span>
            </div>
          </div>
        </div>
      </div>

      {/* Уведомления */}
      <div className="absolute bottom-4 left-4 space-y-2">
        {notifications.map((msg, index) => (
          <div
            key={index}
            className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg animate-slide-in"
          >
            {msg}
          </div>
        ))}
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