// frontend/src/App.tsx
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Coins, Gem, Sprout, Star, Menu, X } from 'lucide-react';
import AnimatedFarmGrid from './game/graphics/AnimatedFarmGrid';
import LevelProgress from './components/LevelSystem/LevelProgress';
import LevelUpModal from './components/LevelSystem/LevelUpModal';
import UnlockedFeatures from './components/LevelSystem/UnlockedFeatures';
import ShopModal from './components/Shop/ShopModal';
import SellModal from './components/Sell/SellModal';
import { useLevelSystem } from './hooks/useLevelSystem';
import { useGame } from './hooks/useGame';
import { PlantInfo, LevelInfo } from './types/game.types';
import { API_BASE } from './config';
import { showXpAnimation } from './utils/xpAnimations';

// Иконки растений
const PLANT_EMOJIS: Record<string, string> = {
  carrot: '🥕',
  tomato: '🍅',
  cucumber: '🥒',
  strawberry: '🍓',
  pumpkin: '🎃'
};

const PLANT_NAMES: Record<string, string> = {
  carrot: 'Морковь',
  tomato: 'Помидор',
  cucumber: 'Огурец',
  strawberry: 'Клубника',
  pumpkin: 'Тыква'
};

// Тестовые данные растений (если API не работает)
const DEFAULT_PLANTS: PlantInfo[] = [
  {
    type: 'carrot',
    seed_price: 10,
    sell_price: 15,
    growth_time: 300,
    required_level: 1,
    rarity: 'common',
    description: 'Быстрорастущая морковь'
  },
  {
    type: 'tomato',
    seed_price: 20,
    sell_price: 30,
    growth_time: 600,
    required_level: 2,
    rarity: 'uncommon',
    description: 'Сочные помидоры'
  },
  {
    type: 'cucumber',
    seed_price: 30,
    sell_price: 45,
    growth_time: 900,
    required_level: 3,
    rarity: 'rare',
    description: 'Свежие огурцы'
  },
  {
    type: 'strawberry',
    seed_price: 40,
    sell_price: 60,
    growth_time: 1200,
    required_level: 4,
    rarity: 'epic',
    description: 'Сладкая клубника'
  },
  {
    type: 'pumpkin',
    seed_price: 50,
    sell_price: 75,
    growth_time: 1500,
    required_level: 5,
    rarity: 'epic',
    description: 'Большая тыква'
  }
];

// Начальные данные уровня
const DEFAULT_LEVEL_INFO: LevelInfo = {
  current_level: 1,
  current_xp: 0,
  xp_to_next_level: 100,
  unlocked_plants: ['carrot'],
  unlocked_features: []
};

function App() {
  const [plantsInfo, setPlantsInfo] = useState<PlantInfo[]>(DEFAULT_PLANTS);
  const [selectedSeed, setSelectedSeed] = useState<string | null>(null);
  const [expandedLevel, setExpandedLevel] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showSell, setShowSell] = useState(false);
  const [notifications, setNotifications] = useState<Array<{id: number, message: string, type: 'success' | 'error' | 'info'}>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [initialCoins] = useState(100);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Инициализация хуков
  const playerId = 1;
  const {
    levelInfo,
    levelUpData,
    fetchLevelInfo,
    addXP,
    closeLevelUpModal
  } = useLevelSystem(playerId);

  const {
    loading: gameLoading,
    gameState,
    fetchGameState,
    plantSeed: apiPlantSeed,
    harvestPlant: apiHarvestPlant,
    waterPlant: apiWaterPlant,
    buySeed: apiBuySeed,
    sellHarvest: apiSellHarvest
  } = useGame(playerId);

  // Загрузка информации о растениях
  const fetchPlantsInfo = async () => {
    try {
      console.log('Fetching plants info from:', `${API_BASE}/api/plants/info`);
      const response = await fetch(`${API_BASE}/api/plants/info`);

      if (response.ok) {
        const data = await response.json();
        console.log('Plants data received:', data);
        setPlantsInfo(data.plants || DEFAULT_PLANTS);
      } else {
        console.log('Using default plants data');
        setPlantsInfo(DEFAULT_PLANTS);
      }
    } catch (error) {
      console.error('Error fetching plants info:', error);
      setPlantsInfo(DEFAULT_PLANTS);
    }
  };

  // Загрузка начальных данных
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchGameState(),
          fetchPlantsInfo()
        ]);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();

    // Автообновление каждые 30 секунд
    const interval = setInterval(fetchGameState, 30000);
    return () => clearInterval(interval);
  }, [fetchGameState]);

  // Показать уведомление
  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  // Посадка семени
  const handlePlant = async (position: { x: number; y: number }) => {
    if (!selectedSeed) {
      showNotification('Выберите семя для посадки', 'error');
      return;
    }

    const result = await apiPlantSeed(selectedSeed, position);
    if (result.success) {
      await fetchGameState();
      setSelectedSeed(null);
      showNotification('Семя посажено!', 'success');
    } else {
      showNotification(result.error || 'Ошибка посадки', 'error');
    }
  };

  // Сбор урожая
const handleHarvest = async (plantId: string, position: { x: number; y: number }) => {
  const result = await apiHarvestPlant(plantId);
  if (result.success) {
    if (result.xp) {
      addXP(result.xp);
      showXpAnimation(result.xp, position); // Исправлено: 2 аргумента вместо 3
    }
    await fetchGameState();
    showNotification('Урожай собран!', 'success');
  } else {
    showNotification(result.error || 'Ошибка сбора', 'error');
  }
};
  // Полив растения
  const handleWater = async (x: number, y: number) => {
    const result = await apiWaterPlant(x, y);
    if (result.success) {
      await fetchGameState();
      showNotification('Растение полито!', 'success');
    } else {
      showNotification(result.error || 'Ошибка полива', 'error');
    }
  };

  // Покупка семян
  const handleBuySeed = async (seedType: string, quantity: number) => {
    console.log('Buying seed:', seedType, 'quantity:', quantity);

    const plant = plantsInfo.find(p => p.type === seedType);
    if (!plant) {
      showNotification('Растение не найдено', 'error');
      return;
    }

    const cost = plant.seed_price * quantity;
    const currentCoins = gameState?.player?.coins || initialCoins;

    if (currentCoins < cost) {
      showNotification('Недостаточно монет', 'error');
      return;
    }

    try {
      const result = await apiBuySeed(seedType, quantity);
      if (result.success) {
        await fetchGameState();
        showNotification(`Куплено ${quantity} семян ${PLANT_NAMES[seedType] || seedType}`, 'success');
      } else {
        showNotification(result.error || 'Ошибка покупки', 'error');
      }
    } catch (error) {
      console.error('Error buying seed:', error);
      showNotification('Ошибка при покупке', 'error');
    }
  };

  // Продажа урожая
  const handleSellHarvest = async (plantType: string, quantity: number) => {
    const result = await apiSellHarvest(plantType, quantity);
    if (result.success) {
      if (result.xp) {
        addXP(result.xp);
      }
      await fetchGameState();
      showNotification(`Продано ${quantity} урожая`, 'success');
    } else {
      showNotification(result.error || 'Ошибка продажи', 'error');
    }
  };

  // Обновить игру
  const handleRefreshGame = async () => {
    await fetchGameState();
    showNotification('Игра обновлена!', 'success');
  };

  // Отображение инвентаря семян
  const seedInventory = Object.entries(gameState?.inventory?.seeds || {}).map(([type, count]) => ({
    type,
    count: count as number,
    name: PLANT_NAMES[type] || type,
    emoji: PLANT_EMOJIS[type] || '🌱'
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Farmers Dream</h1>
          <p className="text-gray-600">Загрузка фермы...</p>
        </div>
      </div>
    );
  }

  // Используем данные из хука или дефолтные
  const currentLevelInfo = levelInfo || DEFAULT_LEVEL_INFO;
  const currentCoins = gameState?.player?.coins || initialCoins;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 p-3 sm:p-4">
      {/* Шапка - АДАПТИВНАЯ ВЕРСИЯ */}
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-4 sm:mb-6 p-3 sm:p-4 bg-white rounded-xl sm:rounded-2xl shadow-lg">

          {/* Левая часть: Логотип и название + мобильное меню */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Gamepad2 className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-green-600" />
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 truncate">
                Farmers Dream
              </h1>
            </div>

            {/* Мобильное меню кнопка (только на мобильных) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-1.5 rounded-lg bg-gray-100"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-700" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700" />
              )}
            </button>
          </div>

          {/* Правая часть: Уровень и валюта (скрыто на мобильных в меню) */}
          <div className={`${mobileMenuOpen ? 'flex' : 'hidden'} sm:flex flex-wrap gap-2 justify-end`}>

            {/* Уровень */}
            <button
              onClick={() => {
                setExpandedLevel(!expandedLevel);
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-1 sm:space-x-2 px-3 py-1.5 sm:px-3 sm:py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg sm:rounded-xl hover:opacity-90 transition w-full sm:w-auto justify-center"
            >
              <Star className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="font-bold text-sm sm:text-base">Ур. {currentLevelInfo.current_level}</span>
            </button>

            {/* Монеты */}
            <div className="flex items-center space-x-1 sm:space-x-2 px-3 py-1.5 sm:px-3 sm:py-2 bg-amber-100 rounded-lg sm:rounded-xl w-full sm:w-auto justify-center">
              <Coins className="w-4 h-4 sm:w-4 sm:h-4 text-amber-600" />
              <span className="font-bold text-amber-800 text-sm sm:text-base whitespace-nowrap">
                {currentCoins}
              </span>
            </div>

            {/* Кристаллы */}
            <div className="flex items-center space-x-1 sm:space-x-2 px-3 py-1.5 sm:px-3 sm:py-2 bg-purple-100 rounded-lg sm:rounded-xl w-full sm:w-auto justify-center">
              <Gem className="w-4 h-4 sm:w-4 sm:h-4 text-purple-600" />
              <span className="font-bold text-purple-800 text-sm sm:text-base whitespace-nowrap">
                {gameState?.player?.diamonds || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Уровень (расширяемый) */}
        <AnimatePresence>
          {expandedLevel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 sm:mb-6 overflow-hidden"
            >
              <LevelProgress
                levelInfo={currentLevelInfo}
                onAddXP={addXP}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Основной контент */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Ферма */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Ваша ферма</h2>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">5x5 клеток для выращивания растений</p>

              {gameLoading ? (
                <div className="flex justify-center items-center h-64 sm:h-96">
                  <div className="text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
                    <p className="text-gray-600 text-sm sm:text-base">Ферма загружается...</p>
                  </div>
                </div>
              ) : (
                <>
                  <SimpleFarmGrid
                    farm={gameState?.farm || []}
                    onPlant={handlePlant}
                    onHarvest={handleHarvest}
                    onWater={handleWater}
                    selectedSeed={selectedSeed}
                  />

                  <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-green-50 rounded-xl">
                    <p className="text-green-700 flex items-start sm:items-center text-sm sm:text-base">
                      <Sprout className="w-4 h-4 sm:w-5 sm:h-5 mr-2 mt-0.5 flex-shrink-0" />
                      <span>💡 Совет: Нажмите на пустую клетку, чтобы посадить выбранное семя. Собирайте урожай вовремя, чтобы получить больше XP!</span>
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Боковая панель */}
          <div className="space-y-4 sm:space-y-6">
            {/* Выбранное семя */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">🌱 Выбрано для посадки</h3>

              {selectedSeed ? (
                <div className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 bg-green-50 rounded-xl">
                  <span className="text-2xl sm:text-3xl">{PLANT_EMOJIS[selectedSeed] || '🌱'}</span>
                  <div>
                    <p className="font-bold text-gray-800 text-sm sm:text-base">{PLANT_NAMES[selectedSeed] || selectedSeed}</p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      В инвентаре: {gameState?.inventory?.seeds?.[selectedSeed] || 0} шт.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 sm:p-8 text-gray-500">
                  <span className="text-2xl sm:text-3xl">🌱</span>
                  <p className="mt-2 text-sm sm:text-base">Выберите семя из инвентаря</p>
                </div>
              )}
            </div>

            {/* Инвентарь семян */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">🎒 Семена</h3>

              {seedInventory.length > 0 ? (
                <>
                  <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">{seedInventory.length} видов семян</p>
                  <div className="space-y-2 sm:space-y-3">
                    {seedInventory.map((seed) => (
                      <button
                        key={seed.type}
                        onClick={() => {
                          setSelectedSeed(seed.type);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 sm:p-3 rounded-lg sm:rounded-xl transition ${
                          selectedSeed === seed.type
                            ? 'bg-green-100 border-2 border-green-500'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <span className="text-xl sm:text-2xl">{seed.emoji}</span>
                          <div className="text-left">
                            <p className="font-bold text-gray-800 text-sm sm:text-base">{seed.name}</p>
                            <p className="text-xs sm:text-sm text-gray-600">{seed.count} шт.</p>
                          </div>
                        </div>
                        {selectedSeed === seed.type && (
                          <span className="text-green-600 font-bold text-sm sm:text-base">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center p-6 sm:p-8 text-gray-500">
                  <span className="text-3xl sm:text-4xl block mb-2">🌾</span>
                  <p className="text-sm sm:text-base">Семян нет</p>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
                    Купите семена в магазине
                  </p>
                </div>
              )}
            </div>

            {/* Быстрые действия */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">⚡ Быстрые действия</h3>

              <div className="space-y-2 sm:space-y-3">
                <button
                  onClick={() => {
                    setShowShop(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg sm:rounded-xl hover:opacity-90 transition"
                >
                  <span className="font-bold text-sm sm:text-base">🛒 Магазин семян</span>
                  <span className="text-base sm:text-lg">→</span>
                </button>

                <button
                  onClick={() => {
                    setShowSell(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg sm:rounded-xl hover:opacity-90 transition"
                >
                  <span className="font-bold text-sm sm:text-base">💰 Продать урожай</span>
                  <span className="text-base sm:text-lg">→</span>
                </button>

                <button
                  onClick={() => {
                    handleRefreshGame();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg sm:rounded-xl hover:opacity-90 transition"
                >
                  <span className="font-bold text-sm sm:text-base">🔄 Обновить игру</span>
                  <span className="text-base sm:text-lg">↻</span>
                </button>
              </div>

              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-xl">
                <p className="text-blue-700 text-sm sm:text-base">
                  💎 Совет: Выполняйте действия регулярно, чтобы быстрее повышать уровень и открывать новые возможности!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Модальные окна */}
      {showShop && (
        <ShopModal
          key="shop-modal"
          unlockedPlants={['carrot', 'tomato', 'cucumber']} // Временно разблокируем растения
          plantsInfo={plantsInfo}
          coins={currentCoins}
          onBuy={handleBuySeed}
          onClose={() => setShowShop(false)}
        />
      )}

      {showSell && (
        <SellModal
          key="sell-modal"
          plantsInfo={plantsInfo}
          onSell={handleSellHarvest}
          onClose={() => setShowSell(false)}
          gameState={gameState}
        />
      )}

      {levelUpData && (
        <LevelUpModal
          key="levelup-modal"
          levelData={levelUpData}
          onClose={closeLevelUpModal}
        />
      )}

      {/* UnlockedFeatures с проверкой на null */}
      {currentLevelInfo.unlocked_features && currentLevelInfo.unlocked_features.length > 0 && (
        <UnlockedFeatures
          key="unlocked-features"
          levelInfo={currentLevelInfo}
        />
      )}

      {/* Уведомления */}
      <div className="fixed bottom-3 sm:bottom-4 right-3 sm:right-4 space-y-2 z-50">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl shadow-lg text-sm sm:text-base ${
                notification.type === 'success' ? 'bg-green-500' :
                notification.type === 'error' ? 'bg-red-500' :
                'bg-blue-500'
              } text-white font-medium`}
            >
              {notification.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;