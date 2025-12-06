import { useEffect, useState } from 'react'
import { Header } from './components/UI/Header'
import { FarmGrid } from './game/graphics/FarmGrid'
import { StatsPanel } from './components/UI/StatsPanel'
import { ActionBar } from './components/UI/ActionBar'

function App() {
  const [isTelegram, setIsTelegram] = useState(false)
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    // Проверяем, запущено ли в Telegram WebApp
    if (window.Telegram?.WebApp) {
      setIsTelegram(true)
      const tg = window.Telegram.WebApp
      tg.expand() // Развернуть на весь экран
      tg.enableClosingConfirmation() // Подтверждение закрытия
      setUserData(tg.initDataUnsafe?.user)

      // Устанавливаем тему
      document.documentElement.style.backgroundColor = tg.themeParams.bg_color || '#f0f0f0'

      console.log('Telegram WebApp initialized:', tg.initDataUnsafe)
    } else {
      console.log('Running in browser mode')
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 p-4 pb-24">
      {/* Telegram User Info */}
      {isTelegram && userData && (
        <div className="bg-gradient-to-r from-telegram-500 to-telegram-600 text-white p-3 rounded-xl mb-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                <span className="text-xl">
                  {userData.first_name?.[0] || '👨‍🌾'}
                </span>
              </div>
              <div>
                <div className="font-bold">{userData.first_name || 'Игрок'}</div>
                <div className="text-xs opacity-80">
                  {userData.username ? `@${userData.username}` : 'ID: ' + userData.id}
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
              <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white p-3 rounded-lg font-bold hover:from-orange-600 hover:to-orange-700 transition-all">
                🥕 Морковь - 10 💰
              </button>
              <button className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-3 rounded-lg font-bold hover:from-yellow-600 hover:to-yellow-700 transition-all">
                🌾 Пшеница - 20 💰
              </button>
              <button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white p-3 rounded-lg font-bold hover:from-purple-600 hover:to-purple-700 transition-all">
                🥔 Картофель - 15 💰
              </button>
            </div>
          </div>
        </div>

        {/* Центр - игровое поле */}
        <div className="flex-1">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-green-100">
            <h2 className="text-2xl font-bold mb-6 text-green-800 text-center">
              🌱 Ваша ферма - 5x5 клеток
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
          <p>Backend: <span className="text-green-600 font-bold">✓ Работает</span></p>
          <p>Frontend: <span className="text-green-600 font-bold">✓ Работает</span></p>
          {!isTelegram && (
            <p className="mt-2 text-orange-600 font-bold">
              ⚡ Для полного опыта откройте через Telegram бота!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default App