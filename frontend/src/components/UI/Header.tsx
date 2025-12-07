import { Coins, User, TrendingUp } from 'lucide-react'

export const Header = () => {
  // Проверяем Telegram без useState чтобы избежать ошибок
  const isTelegramApp = typeof window !== 'undefined' && window.Telegram?.WebApp !== undefined
  const telegramUser = isTelegramApp ? window.Telegram?.WebApp.initDataUnsafe?.user : null

  return (
    <header className="bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-2xl p-4 md:p-6 shadow-xl mb-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="text-center md:text-left mb-4 md:mb-0">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center justify-center md:justify-start">
            <span className="mr-3">🌱</span>
            Farmers Dream
            <span className="ml-3 text-yellow-300">🚜</span>
          </h1>
          <p className="opacity-90">
            {isTelegramApp ? 'Фермерская игра прямо в Telegram!' : 'Фермерская игра'}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 md:gap-4">
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl min-w-[120px]">
            <div className="flex items-center justify-center mb-1">
              <Coins className="w-5 h-5 mr-2" />
              <div className="text-2xl font-bold">100</div>
            </div>
            <div className="text-xs opacity-80 text-center">Баланс</div>
          </div>

          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl min-w-[120px]">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="w-5 h-5 mr-2" />
              <div className="text-2xl font-bold">1</div>
            </div>
            <div className="text-xs opacity-80 text-center">Уровень</div>
          </div>

          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl min-w-[120px]">
            <div className="flex items-center justify-center mb-1">
              <User className="w-5 h-5 mr-2" />
              <div className="text-lg font-bold truncate max-w-[80px]">
                {telegramUser?.first_name || 'Игрок'}
              </div>
            </div>
            <div className="text-xs opacity-80 text-center">
              {telegramUser?.username ? `@${telegramUser.username}` : 'Игрок'}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}