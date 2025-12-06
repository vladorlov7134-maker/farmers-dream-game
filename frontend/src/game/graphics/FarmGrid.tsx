import { useEffect, useRef } from 'react'

export const FarmGrid = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Настройки
    const tileSize = 60
    const gridSize = 5 // 5x5

    // Очищаем canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Рисуем сетку фермы
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        // Изометрические координаты
        const isoX = (x - y) * tileSize / 2
        const isoY = (x + y) * tileSize / 4

        // Рисуем тайл земли
        ctx.fillStyle = y % 2 === 0 ? '#A0522D' : '#8B4513'
        ctx.fillRect(
          isoX + canvas.width/2 - tileSize,
          isoY + 50,
          tileSize,
          tileSize/2
        )

        // Граница тайла
        ctx.strokeStyle = '#654321'
        ctx.lineWidth = 2
        ctx.strokeRect(
          isoX + canvas.width/2 - tileSize,
          isoY + 50,
          tileSize,
          tileSize/2
        )

        // Текст координат (для отладки)
        ctx.fillStyle = 'white'
        ctx.font = '12px Arial'
        ctx.fillText(
          `${x},${y}`,
          isoX + canvas.width/2 - tileSize + 5,
          isoY + 50 + 20
        )
      }
    }
  }, [])

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        className="w-full h-auto border-2 border-farm-brown rounded-lg bg-gradient-to-b from-sky-100 to-green-100"
      />
      <div className="absolute top-4 left-4 bg-black/70 text-white p-2 rounded-lg">
        🖱️ Кликните на клетку для посадки
      </div>
    </div>
  )
}