import { useEffect, useState } from 'react'
import { Header } from './components/UI/Header'
import { FarmGrid } from './game/graphics/FarmGrid'
import { StatsPanel } from './components/UI/StatsPanel'
import { ActionBar } from './components/UI/ActionBar'

// Проверяем запущено ли в Telegram
const isTelegram = () => {
  return typeof window !== 'undefined' && window.Telegram?.WebApp !== undefined
}

function App() {
  const [telegramData, setTelegramData] = useState<any>(null)
  const [isTelegramApp, setIsTelegramApp] = useState(false)

  useEffect(() => {
    // Проверяем запущено ли в Telegram WebApp
    const tg = window.Telegram?.WebApp
    if (tg) {
      setIsTelegramApp(true)
      tg.expand() // Развернуть на весь экран
      tg.enableClosingConfirmation() // Подтверждение закрытия
      setTelegramData({
        user: tg.initDataUnsafe?.user,
        theme: tg.themeParams
      })

      // Устанавливаем фон из темы Telegram
      document.documentElement.style.backgroundColor = tg.themeParams.bg_color || '#f0f0f0'
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 p-4 pb-24">
      {/* Показываем информацию о Telegram если запущено в WebApp */}
      {isTelegramApp && telegramData?.user && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-xl mb-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                <span className="text-xl">
                  {telegramData.user.first_name?.[0] || '👨‍🌾'}
                </span>
              </div>
              <div>
                <div className="font-bold">{telegramData.user.first_name}</div>
                <div className="text-xs opacity-80">
                  {telegramData.user.username ? `@${telegramData.user.username}` : `ID: ${telegramData.user.id}`}
                </div>
              </div>
            </div>
            <div className="text-sm bg-white/20 px-3 py-1 rounded-lg">
              Telegram WebApp
            </div>
          </div>
        </div>
      )}

      <Header />

      <div className="flex flex-col lg:flex-row gap-6 mt-6">
        {/* Левая панель - статистика */}
        <div className="lg:w-1/4">
          <StatsPanel />

          {/* Магазин быстрого доступа */}
          <div className="mt-6 bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-green-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              🏪 Быстрая покупка
            </h3>
            <div className="space-y-3">
              <button
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white p-3 rounded-lg font-bold hover:from-orange-600 hover:to-orange-700 transition-all"
                onClick={() => alert('Куплена морковь!')}
              >
                🥕 Морковь - 10 💰
              </button>
              <button
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-3 rounded-lg font-bold hover:from-yellow-600 hover:to-yellow-700 transition-all"
                onClick={() => alert('Куплена пшеница!')}
              >
                🌾 Пшеница - 20 💰
              </button>
              <button
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white p-3 rounded-lg font-bold hover:from-purple-600 hover:to-purple-700 transition-all"
                onClick={() => alert('Куплен картофель!')}
              >
                🥔 Картофель - 15 💰
              </button>
            </div>
          </div>
        </div>

        {/* Центр - игровое поле */}
        <div className="flex-1">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-green-100">
            <h2 className="text-2xl font-bold mb-6 text-green-800 text-center">
              {isTelegramApp ? '🌱 Ваша ферма в Telegram!' : '🌱 Ваша ферма'}
            </h2>
            <FarmGrid />

            <div className="mt-6 text-center text-gray-600">
              <p className="text-sm">
                💡 <strong>Совет:</strong> Выращивайте разные культуры для большего дохода!
              </p>
              <div className="mt-4 flex justify-center gap-4 text-xs">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">🥕 Морковь: 30 💰</span>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">🌾 Пшеница: 50 💰</span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">🥔 Картофель: 40 💰</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ActionBar />

      {/* Информационная панель */}
      <div className="mt-8 text-center text-gray-600 text-sm">
        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 inline-block">
          <p className="font-bold">Farmers Dream v1.0 🚜</p>
          {isTelegramApp ? (
            <p className="text-green-600 font-bold">✅ Запущено в Telegram WebApp!</p>
          ) : (
            <>
              <p>Для лучшего опыта откройте через Telegram бота!</p>
              <p className="mt-2 text-orange-600 font-bold">
                ⚡ Найдите бота в Telegram и нажмите /start
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default App