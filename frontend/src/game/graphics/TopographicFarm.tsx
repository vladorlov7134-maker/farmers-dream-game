// frontend/src/game/graphics/TopographicFarm.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Droplets, Sun, CloudRain, Trees, Mountain,
  Waves, Thermometer, Wind, Compass
} from 'lucide-react';

interface Plant {
  id: string;
  type: string;
  stage: number;
  planted_at: string;
  last_watered: string;
  is_withered: boolean;
  position: { x: number; y: number };
}

interface TerrainCell {
  x: number;
  y: number;
  height: number; // 0-100 (низина-холм)
  water: number;  // 0-100 (влажность)
  fertility: number; // 0-100 (плодородие)
  type: 'grass' | 'hill' | 'forest' | 'water' | 'rocky';
  plant?: Plant;
}

interface TopographicFarmProps {
  farm: Plant[];
  onPlant: (position: { x: number; y: number }) => void;
  onHarvest: (plantId: string, position: { x: number; y: number }) => void;
  onWater: (x: number, y: number) => void;
  selectedSeed: string | null;
}

const TERRAIN_COLORS = {
  grass: ['#a3d977', '#8bc34a', '#689f38'],
  hill: ['#d7ccc8', '#bcaaa4', '#8d6e63'],
  forest: ['#81c784', '#4caf50', '#2e7d32'],
  water: ['#4fc3f7', '#29b6f6', '#0288d1'],
  rocky: ['#b0bec5', '#78909c', '#546e7a']
};

const PLANT_PREFERENCES: Record<string, { terrain: string[], height: [number, number], water: number }> = {
  carrot: { terrain: ['grass'], height: [20, 60], water: 40 },
  tomato: { terrain: ['grass', 'hill'], height: [30, 70], water: 50 },
  cucumber: { terrain: ['grass'], height: [10, 50], water: 70 },
  strawberry: { terrain: ['grass', 'forest'], height: [10, 40], water: 60 },
  pumpkin: { terrain: ['hill', 'grass'], height: [40, 80], water: 45 }
};

const TopographicFarm: React.FC<TopographicFarmProps> = ({
  farm = [],
  onPlant,
  onHarvest,
  onWater,
  selectedSeed
}) => {
  const [terrain, setTerrain] = useState<TerrainCell[][]>([]);
  const [selectedCell, setSelectedCell] = useState<TerrainCell | null>(null);
  const [weather, setWeather] = useState<'sunny' | 'rainy' | 'cloudy'>('sunny');
  const [temperature, setTemperature] = useState(22);
  const [windSpeed, setWindSpeed] = useState(5);
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'day' | 'evening' | 'night'>('day');

  // Генерация реалистичного ландшафта
  useEffect(() => {
    const generateTerrain = () => {
      const size = 8;
      const grid: TerrainCell[][] = [];

      // Генерация высот (Perlin noise упрощенный)
      const heights: number[][] = [];
      for (let y = 0; y < size; y++) {
        heights[y] = [];
        for (let x = 0; x < size; x++) {
          // Создаем холмы и долины
          const distanceFromCenter = Math.sqrt(
            Math.pow(x - size/2, 2) + Math.pow(y - size/2, 2)
          );
          const baseHeight = 50 - distanceFromCenter * 5;
          const noise = Math.sin(x * 0.5) * Math.cos(y * 0.5) * 20;
          heights[y][x] = Math.max(0, Math.min(100, baseHeight + noise));
        }
      }

      // Создание клеток
      for (let y = 0; y < size; y++) {
        const row: TerrainCell[] = [];
        for (let x = 0; x < size; x++) {
          const height = heights[y][x];
          let type: TerrainCell['type'] = 'grass';
          let water = 30;
          let fertility = 70;

          // Определяем тип местности по высоте
          if (height < 20) {
            type = 'water';
            water = 90;
            fertility = 20;
          } else if (height < 40) {
            type = 'grass';
            water = 50;
            fertility = 80;
          } else if (height < 60) {
            type = 'hill';
            water = 30;
            fertility = 60;
          } else if (height < 80) {
            type = 'forest';
            water = 60;
            fertility = 70;
          } else {
            type = 'rocky';
            water = 10;
            fertility = 30;
          }

          // Добавляем реку
          if (Math.abs(x - y) < 2 && height < 50) {
            type = 'water';
            water = 100;
          }

          // Находим растение на этой позиции
          const plant = farm.find(p => p.position.x === x && p.position.y === y);

          row.push({
            x, y, height, water, fertility, type,
            plant
          });
        }
        grid.push(row);
      }
      setTerrain(grid);
    };

    generateTerrain();
  }, [farm]);

  // Смена погоды и времени
  useEffect(() => {
    const weatherInterval = setInterval(() => {
      const weatherTypes: Array<'sunny' | 'rainy' | 'cloudy'> = ['sunny', 'rainy', 'cloudy'];
      setWeather(weatherTypes[Math.floor(Math.random() * weatherTypes.length)]);

      // Температура меняется в зависимости от времени и погоды
      const timeValues = { morning: 18, day: 25, evening: 20, night: 15 };
      const timeKeys = Object.keys(timeValues) as Array<keyof typeof timeValues>;
      const newTime = timeKeys[Math.floor(Math.random() * timeKeys.length)];
      setTimeOfDay(newTime);

      let baseTemp = timeValues[newTime];
      if (weather === 'sunny') baseTemp += 5;
      if (weather === 'rainy') baseTemp -= 3;
      setTemperature(baseTemp + Math.random() * 4 - 2);

      setWindSpeed(3 + Math.random() * 10);
    }, 30000);

    return () => clearInterval(weatherInterval);
  }, [weather]);

  const handleCellClick = (cell: TerrainCell) => {
    setSelectedCell(cell);

    if (cell.plant) {
      if (cell.plant.stage >= 3 && !cell.plant.is_withered) {
        onHarvest(cell.plant.id, { x: cell.x, y: cell.y });
      } else if (cell.plant.is_withered) {
        onWater(cell.x, cell.y);
      }
    } else {
      if (selectedSeed) {
        // Проверяем, подходит ли местность для растения
        const preferences = PLANT_PREFERENCES[selectedSeed];
        if (preferences) {
          const isSuitable =
            preferences.terrain.includes(cell.type) &&
            cell.height >= preferences.height[0] &&
            cell.height <= preferences.height[1] &&
            cell.water >= preferences.water - 20 &&
            cell.water <= preferences.water + 20;

          if (isSuitable) {
            onPlant({ x: cell.x, y: cell.y });
          } else {
            // Можно показать уведомление, что местность не подходит
            console.log('Эта местность не подходит для данного растения');
          }
        }
      }
    }
  };

  const getTerrainColor = (cell: TerrainCell) => {
    const colors = TERRAIN_COLORS[cell.type];
    const heightIndex = Math.floor(cell.height / 33);
    return colors[Math.min(heightIndex, colors.length - 1)];
  };

  const getPlantSuitability = (cell: TerrainCell, plantType: string) => {
    if (!selectedSeed) return 0;
    const preferences = PLANT_PREFERENCES[plantType];
    if (!preferences) return 0;

    let score = 0;
    if (preferences.terrain.includes(cell.type)) score += 33;
    if (cell.height >= preferences.height[0] && cell.height <= preferences.height[1]) score += 33;
    if (Math.abs(cell.water - preferences.water) < 20) score += 34;

    return score;
  };

  const renderWeatherEffects = () => {
    switch (weather) {
      case 'rainy':
        return (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-0.5 bg-blue-300/40"
                initial={{ y: -20, x: Math.random() * 400 }}
                animate={{ y: 300 }}
                transition={{ duration: 1 + Math.random(), repeat: Infinity }}
                style={{ left: `${Math.random() * 100}%` }}
              />
            ))}
          </div>
        );
      case 'sunny':
        return (
          <div className="absolute top-4 right-4 animate-pulse">
            <Sun className="w-10 h-10 text-yellow-400/60" />
          </div>
        );
      default:
        return null;
    }
  };

  if (terrain.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Генерируем ландшафт...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="topographic-farm-container relative">
      {/* Панель погоды */}
      <motion.div
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        className="mb-6 p-4 bg-gradient-to-r from-blue-50/90 to-cyan-50/90 rounded-2xl border border-blue-200/50 backdrop-blur-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {weather === 'sunny' && <Sun className="w-6 h-6 text-yellow-500" />}
              {weather === 'rainy' && <CloudRain className="w-6 h-6 text-blue-500" />}
              {weather === 'cloudy' && <CloudRain className="w-6 h-6 text-gray-500" />}
              <span className="font-semibold capitalize">{weather === 'sunny' ? 'Солнечно' : weather === 'rainy' ? 'Дождь' : 'Облачно'}</span>
            </div>

            <div className="flex items-center space-x-2">
              <Thermometer className="w-6 h-6 text-red-500" />
              <span className="font-semibold">{temperature}°C</span>
            </div>

            <div className="flex items-center space-x-2">
              <Wind className="w-6 h-6 text-gray-500" />
              <span className="font-semibold">{windSpeed} км/ч</span>
            </div>

            <div className="flex items-center space-x-2">
              <Compass className="w-6 h-6 text-green-500" />
              <span className="font-semibold capitalize">{timeOfDay === 'morning' ? 'Утро' : timeOfDay === 'day' ? 'День' : timeOfDay === 'evening' ? 'Вечер' : 'Ночь'}</span>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            {timeOfDay === 'morning' && '🌅 Лучшее время для посадки'}
            {timeOfDay === 'day' && '☀️ Растения активно растут'}
            {timeOfDay === 'evening' && '🌇 Пора собирать урожай'}
            {timeOfDay === 'night' && '🌙 Растения отдыхают'}
          </div>
        </div>
      </motion.div>

      {/* Карта высот */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-700">Карта высот</h3>
        <div className="flex items-center space-x-2 text-xs">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#0288d1] mr-1"></div>
            <span>Вода</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#8bc34a] mr-1"></div>
            <span>Равнина</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#8d6e63] mr-1"></div>
            <span>Холмы</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#2e7d32] mr-1"></div>
            <span>Лес</span>
          </div>
        </div>
      </div>

      {/* Основная ферма с топографией */}
      <div className="relative bg-gradient-to-br from-sky-100/30 to-emerald-100/30 rounded-3xl p-6 border border-gray-200/50">
        {/* Погодные эффекты */}
        {renderWeatherEffects()}

        {/* Топографическая сетка */}
        <div className="grid grid-cols-8 gap-2 mx-auto max-w-3xl">
          {terrain.map((row, y) => (
            row.map((cell, x) => {
              const suitability = selectedSeed ? getPlantSuitability(cell, selectedSeed) : 0;
              const isSelected = selectedCell?.x === x && selectedCell?.y === y;

              return (
                <motion.div
                  key={`${x}-${y}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    boxShadow: isSelected
                      ? '0 0 20px rgba(59, 130, 246, 0.5)'
                      : `0 ${cell.height/20}px ${cell.height/10}px rgba(0,0,0,0.1)`
                  }}
                  whileHover={{ scale: 1.05, zIndex: 10 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    relative rounded-lg cursor-pointer transition-all duration-300
                    ${isSelected ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
                    ${selectedSeed && !cell.plant ? 'ring-1 ring-offset-1 ring-green-400/50' : ''}
                  `}
                  style={{
                    height: '60px',
                    backgroundColor: getTerrainColor(cell),
                    backgroundImage: cell.type === 'water'
                      ? 'linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.1) 50%, transparent 50%, transparent 75%, rgba(255,255,255,0.1) 75%)'
                      : cell.type === 'forest'
                      ? 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 1px, transparent 1px)'
                      : undefined,
                    backgroundSize: cell.type === 'water' ? '20px 20px' : cell.type === 'forest' ? '30px 30px' : undefined
                  }}
                  onClick={() => handleCellClick(cell)}
                  title={`${cell.type} | Высота: ${cell.height}% | Влажность: ${cell.water}%`}
                >
                  {/* Индикатор высоты */}
                  <div className="absolute top-1 left-1 text-[8px] text-white/70 font-mono">
                    {cell.height}м
                  </div>

                  {/* Растение */}
                  {cell.plant && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      animate={{
                        y: cell.plant.stage >= 3 ? [0, -2, 0] : 0,
                        scale: cell.plant.is_withered ? 0.9 : 1
                      }}
                      transition={{
                        y: { repeat: cell.plant.stage >= 3 ? Infinity : 0, duration: 2 }
                      }}
                    >
                      <span className="text-2xl">
                        {cell.plant.is_withered ? '🥀' :
                         cell.plant.type === 'carrot' ? '🥕' :
                         cell.plant.type === 'tomato' ? '🍅' :
                         cell.plant.type === 'cucumber' ? '🥒' :
                         cell.plant.type === 'strawberry' ? '🍓' : '🎃'}
                      </span>

                      {/* Стадии роста */}
                      {!cell.plant.is_withered && cell.plant.stage < 3 && (
                        <div className="absolute -bottom-1 text-[10px] bg-black/50 text-white px-1 rounded">
                          {cell.plant.stage + 1}/3
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Индикатор пригодности для посадки */}
                  {!cell.plant && selectedSeed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: suitability > 0 ? 0.7 : 0.3 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="text-xs font-bold">
                        {suitability > 80 ? '✅' : suitability > 50 ? '⚠️' : '❌'}
                      </div>
                    </motion.div>
                  )}

                  {/* Индикатор воды */}
                  {cell.water > 70 && (
                    <div className="absolute bottom-1 right-1">
                      <Droplets className="w-3 h-3 text-blue-500/70" />
                    </div>
                  )}

                  {/* Декорации местности */}
                  {cell.type === 'forest' && !cell.plant && (
                    <div className="absolute bottom-1 left-1">
                      <Trees className="w-3 h-3 text-green-700/50" />
                    </div>
                  )}
                  {cell.type === 'hill' && !cell.plant && (
                    <div className="absolute bottom-1 left-1">
                      <Mountain className="w-3 h-3 text-gray-600/50" />
                    </div>
                  )}
                  {cell.type === 'water' && !cell.plant && (
                    <div className="absolute bottom-1 left-1">
                      <Waves className="w-3 h-3 text-blue-600/50" />
                    </div>
                  )}
                </motion.div>
              );
            })
          ))}
        </div>

        {/* Легенда и подсказки */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <h4 className="font-semibold text-gray-700 mb-2">🌱 Подсказки по посадке</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 🥕 Морковь любит равнины и среднюю влажность</li>
              <li>• 🍅 Помидоры хорошо растут на холмах</li>
              <li>• 🥒 Огурцам нужно много воды</li>
              <li>• 🍓 Клубника предпочитает лесистые участки</li>
              <li>• 🎃 Тыквам нужны высокие сухие места</li>
            </ul>
          </div>

          <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
            <h4 className="font-semibold text-gray-700 mb-2">📊 Статистика местности</h4>
            <div className="text-sm text-gray-600">
              {selectedCell ? (
                <div>
                  <p><strong>Тип:</strong> {
                    selectedCell.type === 'grass' ? 'Равнина' :
                    selectedCell.type === 'hill' ? 'Холмы' :
                    selectedCell.type === 'forest' ? 'Лес' :
                    selectedCell.type === 'water' ? 'Вода' : 'Скалы'
                  }</p>
                  <p><strong>Высота:</strong> {selectedCell.height}%</p>
                  <p><strong>Влажность:</strong> {selectedCell.water}%</p>
                  <p><strong>Плодородие:</strong> {selectedCell.fertility}%</p>
                  {selectedSeed && (
                    <p><strong>Пригодность для {selectedSeed}:</strong> {getPlantSuitability(selectedCell, selectedSeed)}%</p>
                  )}
                </div>
              ) : (
                <p>Кликните на клетку для информации</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TopographicFarm;