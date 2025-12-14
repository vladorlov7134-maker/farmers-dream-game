// frontend/src/App.tsx
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Coins, Gem, Sprout, Star } from 'lucide-react';
import SimpleFarmGrid from './game/graphics/SimpleFarmGrid';
import LevelProgress from './components/LevelSystem/LevelProgress';
import LevelUpModal from './components/LevelSystem/LevelUpModal';
import UnlockedFeatures from './components/LevelSystem/UnlockedFeatures';
import ShopModal from './components/Shop/ShopModal';
import SellModal from './components/Sell/SellModal';
import { useLevelSystem } from './hooks/useLevelSystem';
import { useGame } from './hooks/useGame';
import { PlantInfo } from './types/game.types';
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

function App() {
  const [plantsInfo, setPlantsInfo] = useState<PlantInfo[]>([]);
  const [selectedSeed, setSelectedSeed] = useState<string | null>(null);
  const [expandedLevel, setExpandedLevel] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showSell, setShowSell] = useState(false);
  const [notifications, setNotifications] = useState<Array<{id: number, message: string, type: 'success' | 'error' | 'info'}>>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Инициализация хуков
  const playerId = 1; // В реальном приложении получать из Telegram WebApp
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
      const response = await fetch(`${API_BASE}/api/plants/info`);
      if (response.ok) {
        const data = await response.json();
        setPlantsInfo(data.plants || []);
      }
    } catch (error) {
      console.error('Error fetching plants info:', error);
    }
  };

  // Загрузка начальных данных
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchGameState(),
          fetchLevelInfo(),
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
  }, [fetchGameState, fetchLevelInfo]);

  // Показать уведомление
  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  // Посадка семени
  const handlePlantSeed = async (row: number, col: number) => {
    if (!selectedSeed) {
      showNotification('Выберите семя для посадки', 'error');
      return;
    }

    const result = await apiPlantSeed({ row, col, seedType: selectedSeed });
    if (result.success) {
      await fetchGameState();
      setSelectedSeed(null);
      showNotification('Семя посажено!', 'success');
    } else {
      showNotification(result.error || 'Ошибка посадки', 'error');
    }
  };

  // Сбор урожая
  const handleHarvestPlant = async (row: number, col: number) => {
    const result = await apiHarvestPlant({ row, col });
    if (result.success) {
      if (result.xp) {
        addXP(result.xp);
        showXpAnimation(result.xp, row, col);
      }
      await fetchGameState();
      showNotification('Урожай собран!', 'success');
    } else {
      showNotification(result.error || 'Ошибка сбора', 'error');
    }
  };

  // Полив растения
  const handleWaterPlant = async (row: number, col: number) => {
    const result = await apiWaterPlant({ row, col });
    if (result.success) {
      await fetchGameState();
      showNotification('Растение полито!', 'success');
    } else {
      showNotification(result.error || 'Ошибка полива', 'error');
    }
  };

  // Покупка семян
  const handleBuySeed = async (seedType: string, quantity: number) => {
    const result = await apiBuySeed(seedType, quantity);
    if (result.success) {
      await fetchGameState();
      showNotification(`Куплено ${quantity} семян ${seedType}`, 'success');
    } else {
      showNotification(result.error || 'Ошибка покупки', 'error');
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

  // Обработка клика по клетке
  const handleTileClick = async (row: number, col: number, hasPlant: boolean, plantState?: any) => {
    if (!hasPlant) {
      // Пустая клетка - посадка
      handlePlantSeed(row, col);
    } else if (plantState?.canHarvest) {
      // Растение готово к сбору
      handleHarvestPlant(row, col);
    } else if (plantState?.canWater) {
      // Растение можно полить
      handleWaterPlant(row, col);
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 p-4">
      {/* Шапка */}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-2xl shadow-lg">
          <div className="flex items-center space-x-4">
            <Gamepad2 className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-800">Farmers Dream</h1>
          </div>

          <div className="flex items-center space-x-6">
            <button
              onClick={() => setExpandedLevel(!expandedLevel)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:opacity-90 transition"
            >
              <Star className="w-5 h-5" />
              <span className="font-bold">Уровень {levelInfo ? levelInfo.current_level : 1}</span>
            </button>

            <div className="flex items-center space-x-2 px-4 py-2 bg-amber-100 rounded-xl">
              <Coins className="w-5 h-5 text-amber-600" />
              <span className="font-bold text-amber-800">{gameState?.player?.coins || 0} монет</span>
            </div>

            <div className="flex items-center space-x-2 px-4 py-2 bg-purple-100 rounded-xl">
              <Gem className="w-5 h-5 text-purple-600" />
              <span className="font-bold text-purple-800">{gameState?.player?.diamonds || 0} кристаллов</span>
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
              className="mb-6 overflow-hidden"
            >
              <LevelProgress
                levelInfo={levelInfo}
                onAddXP={addXP}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Основной контент */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ферма */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Ваша ферма</h2>
              <p className="text-gray-600 mb-6">5x5 клеток для выращивания растений</p>

              {gameLoading ? (
                <div className="flex justify-center items-center h-96">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Ферма загружается...</p>
                  </div>
                </div>
              ) : (
                <>
                  <SimpleFarmGrid
                    farm={gameState?.farm || []}
                    plantsInfo={plantsInfo}
                  />

                  <div className="mt-6 p-4 bg-green-50 rounded-xl">
                    <p className="text-green-700 flex items-center">
                      <Sprout className="w-5 h-5 mr-2" />
                      💡 Совет: Нажмите на пустую клетку, чтобы посадить выбранное семя. Собирайте урожай вовремя, чтобы получить больше XP!
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            {/* Выбранное семя */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">🌱 Выбрано для посадки</h3>

              {selectedSeed ? (
                <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-xl">
                  <span className="text-3xl">{PLANT_EMOJIS[selectedSeed] || '🌱'}</span>
                  <div>
                    <p className="font-bold text-gray-800">{PLANT_NAMES[selectedSeed] || selectedSeed}</p>
                    <p className="text-sm text-gray-600">
                      В инвентаре: {gameState?.inventory?.seeds?.[selectedSeed] || 0} шт.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 text-gray-500">
                  <p>Выберите семя из инвентаря</p>
                </div>
              )}
            </div>

            {/* Инвентарь семян */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">🎒 Семена</h3>

              {seedInventory.length > 0 ? (
                <>
                  <p className="text-gray-600 mb-4">{seedInventory.length} видов</p>
                  <div className="space-y-3">
                    {seedInventory.map((seed) => (
                      <button
                        key={seed.type}
                        onClick={() => setSelectedSeed(seed.type)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition ${
                          selectedSeed === seed.type
                            ? 'bg-green-100 border-2 border-green-500'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{seed.emoji}</span>
                          <div className="text-left">
                            <p className="font-bold text-gray-800">{seed.name}</p>
                            <p className="text-sm text-gray-600">{seed.count} шт.</p>
                          </div>
                        </div>
                        {selectedSeed === seed.type && (
                          <span className="text-green-600 font-bold">✓ Выбрано</span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center p-8 text-gray-500">
                  <span className="text-4xl block mb-2">🌾</span>
                  <p>Семян нет</p>
                </div>
              )}
            </div>

            {/* Быстрые действия */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">⚡ Быстрые действия</h3>

              <div className="space-y-3">
                <button
                  onClick={() => setShowShop(true)}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:opacity-90 transition"
                >
                  <span className="font-bold">🛒 Магазин семян</span>
                  <span className="text-lg">→</span>
                </button>

                <button
                  onClick={() => setShowSell(true)}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:opacity-90 transition"
                >
                  <span className="font-bold">💰 Продать урожай</span>
                  <span className="text-lg">→</span>
                </button>

                <button
                  onClick={handleRefreshGame}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:opacity-90 transition"
                >
                  <span className="font-bold">🔄 Обновить игру</span>
                  <span className="text-lg">↻</span>
                </button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <p className="text-blue-700">
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
          unlockedPlants={levelInfo?.unlocked_plants || []}
          plantsInfo={plantsInfo}
          coins={gameState?.player?.coins || 0}
          onBuy={handleBuySeed}
          onClose={() => setShowShop(false)}
        />
      )}

      {showSell && (
        <SellModal
          inventory={gameState?.inventory?.harvest || {}}
          plantsInfo={plantsInfo}
          onSell={handleSellHarvest}
          onClose={() => setShowSell(false)}
        />
      )}

      {levelUpData && (
        <LevelUpModal
          levelData={levelUpData}
          onClose={closeLevelUpModal}
        />
      )}

      {/* UnlockedFeatures с проверкой на null */}
      {levelInfo && levelInfo.unlocked_features && (
        <UnlockedFeatures levelInfo={levelInfo} />
      )}

      {/* Уведомления */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className={`px-6 py-3 rounded-xl shadow-lg ${
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