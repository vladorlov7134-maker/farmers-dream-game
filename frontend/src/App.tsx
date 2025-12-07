import { useEffect, useState } from 'react'
import { Header } from './components/UI/Header'
import { SimpleFarmGrid } from './game/graphics/SimpleFarmGrid'
import { StatsPanel } from './components/UI/StatsPanel'
import { ActionBar } from './components/UI/ActionBar'

function App() {
  const [telegramData, setTelegramData] = useState<any>(null)
  const [isTelegramApp, setIsTelegramApp] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)

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

      // Помечаем что игра началась
      setGameStarted(true)

      console.log('Telegram WebApp initialized:', tg.initDataUnsafe)
    } else {
      console.log('Running in browser mode')
      setGameStarted(true) // В браузере тоже можно играть
    }
  }, [])

  // Если игра еще не загрузилась
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🌱</div>
          <h1 className="text-3xl font-bold text-green-700 mb-2">Farmers Dream</h1>
          <p className="text-gray-600">Загрузка игры...</p>
          <div className="mt-6">
            <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 p-4 pb-24">
      {/* Telegram User Info */}
      {isTelegramApp && telegramData?.user && (
        <div className="bg-gradient-to-r from-telegram-500 to-telegram-600 text-white p-3 rounded-xl mb-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                <span className="text-xl">
                  {telegramData.user.first_name?.[0] || '👨‍🌾'}
                </span>
              </div>
              <div>
                <div className="font-bold">{telegramData.user.first_name || 'Игрок'}</div>
                <div className="text-xs opacity-80">
                  {telegramData.user.username ? `@${telegramData.user.username}` : 'ID: ' + telegramData.user.id}
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

          {/* Быстрые советы */}
          <div className="mt-6 bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-green-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              💡 Советы по игре
            </h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Кликните на пустую клетку чтобы посадить растение</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Кликните на зеленое растение чтобы собрать урожай</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Начинайте с моркови для быстрого старта</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Приглашайте друзей для получения бонусов</span>
              </li>
            </ul>
          </div>

          {/* Информация об игре */}
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 shadow-lg border border-blue-100">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              🎮 Информация
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Версия игры:</span>
                <span className="font-bold">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Размер фермы:</span>
                <span className="font-bold">5x5 клеток</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Режим:</span>
                <span className="font-bold">
                  {isTelegramApp ? 'Telegram WebApp' : 'Браузер'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Центр - игровое поле */}
        <div className="flex-1">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-green-100">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-green-800">
                {isTelegramApp ? '🌱 Ваша ферма в Telegram!' : '🌱 Ваша ферма'}
              </h2>
              <div className="mt-2 md:mt-0 flex items-center space-x-4">
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-bold">
                  🎯 Цель: 1000 монет
                </div>
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-bold">
                  ⭐ Уровень: 1
                </div>
              </div>
            </div>

            <SimpleFarmGrid />

            {/* Информация о культурах */}
            <div className="mt-8 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">🌾 Доход с культур</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🥕</span>
                    <div>
                      <div className="font-bold">Морковь</div>
                      <div className="text-sm text-gray-600">+30 монет</div>
                    </div>
                  </div>
                  <div className="text-green-600 font-bold">2 мин</div>
                </div>
                <div className="bg-white p-3 rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🥔</span>
                    <div>
                      <div className="font-bold">Картофель</div>
                      <div className="text-sm text-gray-600">+40 монет</div>
                    </div>
                  </div>
                  <div className="text-green-600 font-bold">2.5 мин</div>
                </div>
                <div className="bg-white p-3 rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🌾</span>
                    <div>
                      <div className="font-bold">Пшеница</div>
                      <div className="text-sm text-gray-600">+50 монет</div>
                    </div>
                  </div>
                  <div className="text-green-600 font-bold">3 мин</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ActionBar />

      {/* Информационная панель */}
      <div className="mt-8 text-center">
        <div className="inline-flex flex-col items-center bg-white/50 backdrop-blur-sm rounded-xl p-4 shadow-lg">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-2xl">🚜</span>
            <h3 className="text-xl font-bold text-gray-800">Farmers Dream v1.0</h3>
            <span className="text-2xl">🌱</span>
          </div>

          {isTelegramApp ? (
            <div className="space-y-2">
              <p className="text-green-600 font-bold flex items-center justify-center">
                <span className="mr-2">✅</span>
                Запущено в Telegram WebApp!
              </p>
              <p className="text-sm text-gray-600">
                Приглашайте друзей через кнопку "Поделиться" в меню бота
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-gray-700">Для лучшего опыта откройте через Telegram бота!</p>
              <div className="bg-gradient-to-r from-orange-100 to-red-100 p-3 rounded-lg">
                <p className="text-orange-700 font-bold flex items-center justify-center">
                  <span className="mr-2">⚡</span>
                  Найдите бота в Telegram и нажмите /start
                </p>
                <p className="text-sm text-orange-600 mt-1">
                  Получите полный доступ к игре прямо в Telegram
                </p>
              </div>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-200 w-full">
            <p className="text-xs text-gray-500">
              © 2024 Farmers Dream • Фермерская игра • Версия 1.0.0
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App