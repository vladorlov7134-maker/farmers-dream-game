// frontend/src/App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Coins, Gem, Sprout, Trophy, Star, ChevronDown, ChevronUp } from 'lucide-react';
import SimpleFarmGrid from './game/graphics/SimpleFarmGrid';
import LevelProgress from './components/LevelSystem/LevelProgress';
import LevelUpModal from './components/LevelSystem/LevelUpModal';
import UnlockedFeatures from './components/LevelSystem/UnlockedFeatures';
import ShopModal from './components/Shop/ShopModal';
import SellModal from './components/Sell/SellModal';
import { useLevelSystem } from './hooks/useLevelSystem';
import { useGame } from './hooks/useGame';
import { GameState, PlantInfo, LevelInfo } from './types/game.types';
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
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [plantsInfo, setPlantsInfo] = useState<PlantInfo[]>([]);
  const [selectedSeed, setSelectedSeed] = useState<string | null>(null);
  const [expandedLevel, setExpandedLevel] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showSell, setShowSell] = useState(false);
  const [notifications, setNotifications] = useState<Array<{id: number, message: string, type: 'success' | 'error' | 'info'}>>([]);
  
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
    error: gameError,
    fetchGameState,
    plantSeed: apiPlantSeed,
    harvestPlant: apiHarvestPlant,
    waterPlant: apiWaterPlant,
    buySeed: apiBuySeed,
    sellHarvest: apiSellHarvest
  } = useGame(playerId);

  // Загрузка начальных данных
  useEffect(() => {
    const loadInitialData = async () => {
      await fetchGameState();
      await fetchLevelInfo();
      await fetchPlantsInfo();
    };
    
    loadInitialData();
    
    // Автообновление каждые 30 секунд
    const interval = setInterval(fetchGameState, 30000);
    return () => clearInterval(interval);
  }, [fetchGameState, fetchLevelInfo]);

  // Загрузка информации о растениях
  const fetchPlantsInfo = async () => {
    try {
      const response = await fetch(`${API_BASE}/plants_info`);
      if (response.ok) {
        const data = await response.json();
        setPlantsInfo(data.plants || []);
      }
    } catch (error) {
      console.error('Error fetching plants info:', error);
    }
  };

  // Показать уведомление
  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  // Обработчик посадки растения
  const handlePlantSeed = async (position: { x: number, y: number }) => {
    if (!selectedSeed) {
      showNotification('Выберите семя для посадки', 'error');
      return;
    }

    try {
      const result = await apiPlantSeed(selectedSeed, position);
      
      if (result.success) {
        showNotification(`Посажено: ${PLANT_NAMES[selectedSeed] || selectedSeed}`, 'success');
        
        // Добавляем XP за посадку
        const xpAmount = getXpForAction('planting', selectedSeed);
        const xpResult = await addXP(xpAmount, 'planting');
        
        // Показываем анимацию XP
        showXpAnimation(xpAmount, position);
        
        // Обновляем состояние
        await fetchGameState();
        setSelectedSeed(null);
      } else {
        showNotification(result.error || 'Ошибка посадки', 'error');
      }
    } catch (error) {
      showNotification('Ошибка при посадке', 'error');
    }
  };

  // Обработчик сбора урожая
  const handleHarvestPlant = async (plantId: string, position: { x: number, y: number }) => {
    try {
      const result = await apiHarvestPlant(plantId);
      
      if (result.success) {
        showNotification(`Собрано ${result.yield_count} урожая!`, 'success');
        
        // Добавляем XP за сбор
        const xpAmount = getXpForAction('harvesting', result.plant_type);
        const xpResult = await addXP(xpAmount, 'harvesting');
        
        // Показываем анимацию XP
        showXpAnimation(xpAmount, position);
        
        // Обновляем состояние
        await fetchGameState();
      } else {
        showNotification(result.error || 'Ошибка сбора', 'error');
      }
    } catch (error) {
      showNotification('Ошибка при сборе урожая', 'error');
    }
  };

  // Обработчик полива
  const handleWaterPlant = async (position: { x: number, y: number }) => {
    try {
      const result = await apiWaterPlant(position.x, position.y);
      
      if (result.success) {
        showNotification('Растение полито!', 'success');
        
        // Добавляем XP за полив
        const xpResult = await addXP(2, 'watering');
        
        // Показываем анимацию XP
        showXpAnimation(2, position);
        
        // Обновляем состояние
        await fetchGameState();
      } else {
        showNotification(result.error || 'Ошибка полива', 'error');
      }
    } catch (error) {
      showNotification('Ошибка при поливе', 'error');
    }
  };

  // Обработчик покупки семян
  const handleBuySeed = async (plantType: string, amount: number) => {
    try {
      const result = await apiBuySeed(plantType, amount);
      
      if (result.success) {
        showNotification(`Куплено ${amount} семян за ${result.total_price}🪙`, 'success');
        await fetchGameState();
      } else {
        showNotification(result.error || 'Ошибка покупки', 'error');
      }
    } catch (error) {
      showNotification('Ошибка при покупке', 'error');
    }
  };

  // Обработчик продажи урожая
  const handleSellHarvest = async (plantType: string, amount: number) => {
    try {
      const result = await apiSellHarvest(plantType, amount);
      
      if (result.success) {
        showNotification(`Продано ${amount} урожая за ${result.total_price}🪙`, 'success');
        
        // Добавляем XP за продажу
        const xpAmount = getXpForAction('selling', plantType) * amount;
        const xpResult = await addXP(xpAmount, 'selling');
        
        await fetchGameState();
      } else {
        showNotification(result.error || 'Ошибка продажи', 'error');
      }
    } catch (error) {
      showNotification('Ошибка при продаже', 'error');
    }
  };

  // Получить XP за действие
  const getXpForAction = (action: 'planting' | 'harvesting' | 'selling', plantType: string): number => {
    const xpValues: Record<string, Record<string, number>> = {
      planting: {
        carrot: 5,
        tomato: 7,
        cucumber: 8,
        strawberry: 10,
        pumpkin: 15
      },
      harvesting: {
        carrot: 10,
        tomato: 15,
        cucumber: 18,
        strawberry: 25,
        pumpkin: 40
      },
      selling: {
        carrot: 1,
        tomato: 2,
        cucumber: 3,
        strawberry: 4,
        pumpkin: 10
      }
    };
    
    return xpValues[action]?.[plantType] || 5;
  };

  // Получить информацию о растении
  const getPlantInfo = (plantType: string): PlantInfo | undefined => {
    return plantsInfo.find(p => p.type === plantType);
  };

  // Проверить, открыто ли растение
  const isPlantUnlocked = (plantType: string): boolean => {
    if (!levelInfo) return false;
    return levelInfo.unlocked_plants.includes(plantType);
  };

  // Обновить игру
  const handleUpdateGame = async () => {
    await fetchGameState();
    showNotification('Игра обновлена!', 'success');
  };

  // Добавить тестовые XP
  const handleAddTestXP = async () => {
    const result = await addXP(100, 'test');
    if (result) {
      showNotification('+100 XP добавлено!', 'success');
    }
  };

  // Полить все растения
  const handleWaterAll = async () => {
    if (!gameState?.farm) return;
    
    let wateredCount = 0;
    for (const cell of gameState.farm) {
      if (cell.plant && !cell.is_watered) {
        await handleWaterPlant({ x: cell.x, y: cell.y });
        wateredCount++;
        await new Promise(resolve => setTimeout(resolve, 300)); // Задержка для анимаций
      }
    }
    
    if (wateredCount === 0) {
      showNotification('Все растения уже политы', 'info');
    } else {
      showNotification(`Полито ${wateredCount} растений`, 'success');
    }
  };

  // Фильтрация доступных семян
  const availableSeeds = gameState?.inventory.seeds 
    ? Object.entries(gameState.inventory.seeds)
        .filter(([plantType, count]) => count > 0 && isPlantUnlocked(plantType))
        .map(([plantType, count]) => ({ plantType, count }))
    : [];

  // Фильтрация урожая
  const availableHarvest = gameState?.inventory.harvest 
    ? Object.entries(gameState.inventory.harvest)
        .filter(([_, count]) => count > 0)
        .map(([plantType, count]) => ({ plantType, count }))
    : [];

  // Загрузка
  if (gameLoading && !gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-700 text-lg">Загрузка фермы...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-100 p-4 md:p-6">
      {/* Уведомления */}
      <div className="fixed top-4 right-4 z-50 space-y-2 w-80">
        <AnimatePresence>
          {notifications.map(notification => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className={`rounded-lg p-4 shadow-lg ${
                notification.type === 'success' ? 'bg-green-100 border border-green-300 text-green-800' :
                notification.type === 'error' ? 'bg-red-100 border border-red-300 text-red-800' :
                'bg-blue-100 border border-blue-300 text-blue-800'
              }`}
            >
              {notification.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Шапка */}
        <header className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-2xl">
                <Gamepad2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-green-800 mb-1">
                  Farmers Dream
                </h1>
                <p className="text-green-600">Выращивай, собирай, развивайся!</p>
              </div>
            </div>
            
            {/* Баланс */}
            {gameState && (
              <div className="flex flex-wrap gap-3">
                <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 border-2 border-yellow-300 rounded-xl px-4 py-3 flex items-center gap-2 min-w-[140px]">
                  <Coins className="h-5 w-5 text-yellow-600" />
                  <div>
                    <div className="text-sm text-yellow-700">Монеты</div>
                    <div className="text-xl font-bold text-yellow-800">
                      {gameState.inventory.coins}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-100 to-cyan-50 border-2 border-blue-300 rounded-xl px-4 py-3 flex items-center gap-2 min-w-[140px]">
                  <Gem className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-sm text-blue-700">Алмазы</div>
                    <div className="text-xl font-bold text-blue-800">
                      {gameState.inventory.diamonds}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Система уровней */}
        {levelInfo && (
          <div className="mb-6">
            <LevelProgress 
              levelInfo={levelInfo}
              onToggle={() => setExpandedLevel(!expandedLevel)}
              expanded={expandedLevel}
            />
            
            {expandedLevel && (
              <UnlockedFeatures levelInfo={levelInfo} />
            )}
          </div>
        )}

        {/* Модальное окно повышения уровня */}
        {levelUpData && (
          <LevelUpModal 
            levelData={levelUpData}
            onClose={closeLevelUpModal}
          />
        )}

        {/* Модальные окна магазина и продажи */}
        {showShop && (
          <ShopModal
            plantsInfo={plantsInfo}
            coins={gameState?.inventory.coins || 0}
            onBuy={handleBuySeed}
            onClose={() => setShowShop(false)}
            unlockedPlants={levelInfo?.unlocked_plants || []}
          />
        )}
        
        {showSell && (
          <SellModal
            harvest={availableHarvest}
            plantsInfo={plantsInfo}
            onSell={handleSellHarvest}
            onClose={() => setShowSell(false)}
          />
        )}

        {/* Основной контент */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Левая колонка - Ферма */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xl border border-green-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-green-800 flex items-center gap-2">
                    <Sprout className="h-6 w-6" />
                    Ваша ферма
                  </h2>
                  <p className="text-green-600 mt-1">5x5 клеток для выращивания растений</p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setShowShop(true)}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    <Coins className="h-4 w-4" />
                    Купить семена
                  </button>
                  
                  <button
                    onClick={() => setShowSell(true)}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    💰 Продать урожай
                  </button>
                  
                  <button
                    onClick={handleUpdateGame}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-xl font-semibold hover:opacity-90 transition-opacity"
                  >
                    Обновить
                  </button>
                </div>
              </div>
              
              {/* Игровое поле */}
              {gameState ? (
                <SimpleFarmGrid
                  farm={gameState.farm}
                  onPlant={handlePlantSeed}
                  onHarvest={handleHarvestPlant}
                  onWater={handleWaterPlant}
                  selectedSeed={selectedSeed}
                />
              ) : (
                <div className="h-96 flex items-center justify-center">
                  <p className="text-green-700">Ферма загружается...</p>
                </div>
              )}
              
              <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
                <p className="text-green-700 text-sm">
                  💡 <strong>Совет:</strong> Нажмите на пустую клетку, чтобы посадить выбранное семя. 
                  Собирайте урожай вовремя, чтобы получить больше XP!
                </p>
              </div>
            </div>
          </div>

          {/* Правая колонка - Инвентарь и действия */}
          <div className="space-y-6">
            {/* Выбранное семя */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xl border border-green-200">
              <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
                🌱 Выбрано для посадки
              </h3>
              
              {selectedSeed ? (
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-300">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{PLANT_EMOJIS[selectedSeed] || '🌱'}</span>
                    <div>
                      <div className="font-bold text-green-800">
                        {PLANT_NAMES[selectedSeed] || selectedSeed}
                      </div>
                      <div className="text-sm text-green-600">
                        {availableSeeds.find(s => s.plantType === selectedSeed)?.count || 0} шт.
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedSeed(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="text-center p-6 text-green-600">
                  <div className="text-4xl mb-2">🌱</div>
                  <p>Выберите семя из инвентаря</p>
                </div>
              )}
            </div>

            {/* Инвентарь семян */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xl border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-green-800 flex items-center gap-2">
                  🎒 Семена
                </h3>
                <span className="text-sm text-green-600">
                  {availableSeeds.length} видов
                </span>
              </div>
              
              {availableSeeds.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {availableSeeds.map(({ plantType, count }) => {
                    const plantInfo = getPlantInfo(plantType);
                    const unlocked = isPlantUnlocked(plantType);
                    
                    return (
                      <motion.div
                        key={plantType}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => unlocked && setSelectedSeed(plantType)}
                        className={`p-3 rounded-xl cursor-pointer transition-all ${
                          selectedSeed === plantType
                            ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-400'
                            : 'bg-green-50 border border-green-200 hover:border-green-300'
                        } ${!unlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">
                              {PLANT_EMOJIS[plantType] || '🌱'}
                            </span>
                            <div>
                              <div className="font-semibold text-green-800">
                                {PLANT_NAMES[plantType] || plantType}
                              </div>
                              <div className="text-sm text-green-600">
                                {count} шт. • {plantInfo?.seed_price || '?'}🪙
                              </div>
                            </div>
                          </div>
                          
                          {!unlocked ? (
                            <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              🔒 Уровень {plantInfo?.required_level || '?'}
                            </div>
                          ) : (
                            <button className="text-green-600 hover:text-green-800">
                              {selectedSeed === plantType ? '✓ Выбрано' : 'Выбрать'}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center p-6 text-green-600">
                  <div className="text-4xl mb-2">🌾</div>
                  <p>Семян нет</p>
                  <button
                    onClick={() => setShowShop(true)}
                    className="mt-2 text-green-700 hover:text-green-900 underline"
                  >
                    Купить в магазине
                  </button>
                </div>
              )}
            </div>

            {/* Урожай */}
            {availableHarvest.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xl border border-green-200">
                <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
                  📦 Урожай
                </h3>
                
                <div className="space-y-3">
                  {availableHarvest.map(({ plantType, count }) => {
                    const plantInfo = getPlantInfo(plantType);
                    
                    return (
                      <div
                        key={plantType}
                        className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {PLANT_EMOJIS[plantType] || '🌾'}
                          </span>
                          <div>
                            <div className="font-semibold text-yellow-800">
                              {PLANT_NAMES[plantType] || plantType}
                            </div>
                            <div className="text-sm text-yellow-600">
                              {count} шт. • {plantInfo?.sell_price || '?'}🪙 за шт.
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-yellow-700 font-bold">
                          {count * (plantInfo?.sell_price || 0)}🪙
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Быстрые действия */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 md:p-6 shadow-xl border border-purple-200">
              <h3 className="text-xl font-bold text-purple-800 mb-4 flex items-center gap-2">
                ⚡ Быстрые действия
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleWaterAll}
                  disabled={!gameState?.farm?.some(cell => cell.plant && !cell.is_watered)}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  💦 Полить все
                </button>
                
                <button
                  onClick={handleAddTestXP}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Star className="h-4 w-4" />
                  +100 XP (тест)
                </button>
              </div>
              
              <div className="mt-4 p-3 bg-purple-100/50 rounded-xl">
                <p className="text-purple-700 text-sm">
                  💎 <strong>Совет:</strong> Выполняйте действия регулярно, чтобы быстрее повышать уровень и открывать новые возможности!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Статистика */}
        <footer className="mt-8 pt-6 border-t border-green-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">
                {gameState?.farm?.filter(cell => cell.plant).length || 0}
              </div>
              <div className="text-sm text-green-600">Растений</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">
                {levelInfo?.current_level || 1}
              </div>
              <div className="text-sm text-green-600">Уровень</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">
                {levelInfo?.total_xp || 0}
              </div>
              <div className="text-sm text-green-600">Всего XP</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">
                {availableHarvest.reduce((sum, h) => sum + h.count, 0)}
              </div>
              <div className="text-sm text-green-600">Урожая</div>
            </div>
          </div>
          
          <div className="text-center mt-6 text-green-600 text-sm">
            <p>Farmers Dream © 2024 • Система уровней активна!</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;