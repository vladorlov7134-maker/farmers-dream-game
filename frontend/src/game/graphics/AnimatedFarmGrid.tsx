// frontend/src/game/graphics/AnimatedFarmGrid.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Sun, CloudRain, Bug, Sparkles } from 'lucide-react';

interface Plant {
  id: string;
  type: string;
  stage: number;
  planted_at: string;
  last_watered: string;
  is_withered: boolean;
  position: { x: number; y: number };
}

interface AnimatedFarmGridProps {
  farm: Plant[];
  onPlant: (position: { x: number; y: number }) => void;
  onHarvest: (plantId: string, position: { x: number; y: number }) => void;
  onWater: (x: number, y: number) => void;
  selectedSeed: string | null;
}

const PLANT_ANIMATIONS: Record<string, { emoji: string[], color: string, effect?: string }> = {
  carrot: {
    emoji: ['🥕', '🌱', '🥕', '🥕🎋'],
    color: 'from-orange-100 to-orange-50',
    effect: '🌿'
  },
  tomato: {
    emoji: ['🍅', '🌱', '🍅', '🍅🪴'],
    color: 'from-red-100 to-red-50',
    effect: '✨'
  },
  cucumber: {
    emoji: ['🥒', '🌱', '🥒', '🥒🌿'],
    color: 'from-green-100 to-emerald-50',
    effect: '💧'
  },
  strawberry: {
    emoji: ['🍓', '🌱', '🍓', '🍓🌸'],
    color: 'from-pink-100 to-rose-50',
    effect: '🌸'
  },
  pumpkin: {
    emoji: ['🎃', '🌱', '🎃', '🎃🍂'],
    color: 'from-amber-100 to-yellow-50',
    effect: '🍂'
  },
};

const SOIL_TYPES = [
  '🌾', '🪴', '🪨', '🍂', '🌿'
];

const AnimatedFarmGrid: React.FC<AnimatedFarmGridProps> = ({
  farm = [],
  onPlant,
  onHarvest,
  onWater,
  selectedSeed
}) => {
  const gridSize = 5;
  const [hoveredCell, setHoveredCell] = useState<{x: number, y: number} | null>(null);
  const [soilVariants, setSoilVariants] = useState<string[][]>([]);
  const [animations, setAnimations] = useState<Array<{x: number, y: number, type: string}>>([]);

  // Инициализация вариаций почвы
  useEffect(() => {
    const variants = [];
    for (let y = 0; y < gridSize; y++) {
      const row = [];
      for (let x = 0; x < gridSize; x++) {
        row.push(SOIL_TYPES[Math.floor(Math.random() * SOIL_TYPES.length)]);
      }
      variants.push(row);
    }
    setSoilVariants(variants);
  }, []);

  // Анимации для растений
  const addAnimation = (x: number, y: number, type: string) => {
    setAnimations(prev => [...prev, { x, y, type }]);
    setTimeout(() => {
      setAnimations(prev => prev.filter(a => !(a.x === x && a.y === y && a.type === type)));
    }, 2000);
  };

  const grid = [];
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const plant = farm.find(p => p.position.x === x && p.position.y === y);
      grid.push({ x, y, plant });
    }
  }

  const handleCellClick = (x: number, y: number, plant: Plant | undefined) => {
    if (plant) {
      if (plant.stage >= 3 && !plant.is_withered) {
        addAnimation(x, y, 'harvest');
        onHarvest(plant.id, { x, y });
      } else if (plant.is_withered) {
        addAnimation(x, y, 'water');
        onWater(x, y);
      }
    } else {
      if (selectedSeed) {
        addAnimation(x, y, 'plant');
        onPlant({ x, y });
      }
    }
  };

  const getCellBackground = (plant: Plant | undefined) => {
    if (!plant) {
      return 'bg-gradient-to-br from-yellow-50 to-amber-100';
    }

    const plantData = PLANT_ANIMATIONS[plant.type] || PLANT_ANIMATIONS.carrot;
    if (plant.is_withered) {
      return 'bg-gradient-to-br from-gray-200 to-gray-300';
    }
    return `bg-gradient-to-br ${plantData.color}`;
  };

  const getPlantEmoji = (plant: Plant) => {
    if (plant.is_withered) return '🥀';
    const plantData = PLANT_ANIMATIONS[plant.type] || PLANT_ANIMATIONS.carrot;
    const stageIndex = Math.min(plant.stage, plantData.emoji.length - 1);
    return plantData.emoji[stageIndex];
  };

  return (
    <div className="farm-container">
      {/* Анимированный фон фермы */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 animate-pulse">
          <Sun className="w-8 h-8 text-yellow-300" />
        </div>
        <div className="absolute top-4 right-4 animate-bounce">
          <CloudRain className="w-6 h-6 text-blue-300" />
        </div>
      </div>

      {/* Сетка фермы */}
      <div className="relative grid grid-cols-5 gap-2 xs:gap-3 sm:gap-4 max-w-2xl mx-auto p-4 bg-gradient-to-br from-green-50/50 to-amber-50/50 rounded-3xl border-2 border-green-200/50 backdrop-blur-sm">

        {grid.map((cell, index) => {
          const plant = cell.plant;
          const isHovered = hoveredCell?.x === cell.x && hoveredCell?.y === cell.y;

          return (
            <motion.div
              key={`${cell.x}-${cell.y}-${index}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{
                scale: isHovered ? 1.05 : 1,
                opacity: 1,
                y: plant?.stage === 3 ? [0, -2, 0] : 0
              }}
              transition={{
                duration: 0.2,
                y: {
                  repeat: plant?.stage === 3 ? Infinity : 0,
                  duration: 2
                }
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                relative w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20
                rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer
                shadow-lg hover:shadow-xl transition-all duration-300
                ${getCellBackground(plant)}
                ${plant ? 'border-green-300/50' : 'border-amber-300/50'}
                ${selectedSeed && !plant ? 'ring-2 ring-blue-400/50' : ''}
              `}
              onMouseEnter={() => setHoveredCell({ x: cell.x, y: cell.y })}
              onMouseLeave={() => setHoveredCell(null)}
              onClick={() => handleCellClick(cell.x, cell.y, plant)}
            >
              {/* Анимации поверх клетки */}
              <AnimatePresence>
                {animations.map((anim, idx) =>
                  anim.x === cell.x && anim.y === cell.y && (
                    <motion.div
                      key={idx}
                      initial={{ y: 0, opacity: 1 }}
                      animate={{ y: -40, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute pointer-events-none"
                    >
                      {anim.type === 'water' && <Droplets className="w-6 h-6 text-blue-500" />}
                      {anim.type === 'harvest' && <Sparkles className="w-6 h-6 text-yellow-500" />}
                      {anim.type === 'plant' && '🌱'}
                    </motion.div>
                  )
                )}
              </AnimatePresence>

              {/* Почва/фон */}
              {!plant && (
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 10 }}
                  className="text-2xl xs:text-3xl opacity-50"
                >
                  {soilVariants[cell.y]?.[cell.x] || '🪴'}
                </motion.div>
              )}

              {/* Растение */}
              {plant && (
                <>
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: plant.stage === 3 ? [0, 2, -2, 0] : 0
                    }}
                    transition={{
                      scale: { duration: 2, repeat: Infinity },
                      rotate: plant.stage === 3 ? { duration: 3, repeat: Infinity } : {}
                    }}
                    className="text-2xl xs:text-3xl sm:text-4xl relative z-10"
                  >
                    {getPlantEmoji(plant)}
                  </motion.div>

                  {/* Эффекты растений */}
                  {plant.stage >= 2 && !plant.is_withered && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.3, 0.7, 0.3] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <span className="text-xl">
                        {PLANT_ANIMATIONS[plant.type]?.effect || '✨'}
                      </span>
                    </motion.div>
                  )}

                  {/* Индикаторы состояния */}
                  <div className="absolute top-1 right-1 flex flex-col gap-0.5">
                    {plant.is_withered && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="text-xs bg-red-500 text-white rounded-full w-3 h-3 flex items-center justify-center"
                      >
                        💧
                      </motion.div>
                    )}
                    {plant.stage >= 3 && !plant.is_withered && (
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, duration: 0.5 }}
                        className="text-xs bg-yellow-500 text-white rounded-full w-3 h-3 flex items-center justify-center"
                      >
                        !
                      </motion.div>
                    )}
                    {plant.stage < 3 && (
                      <div className="text-[10px] text-gray-600">
                        {plant.stage + 1}/3
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Подсказка при наведении */}
              {isHovered && !plant && selectedSeed && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20"
                >
                  Посадить {selectedSeed}
                </motion.div>
              )}

              {/* Координаты */}
              <div className="absolute bottom-0.5 left-0.5 text-[8px] xs:text-[10px] text-gray-500/70 font-mono">
                {cell.x},{cell.y}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Статистика фермы */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 p-4 bg-gradient-to-r from-green-50/80 to-emerald-50/80 rounded-2xl border border-green-200/50"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="text-center">
            <div className="text-lg font-bold text-green-700">
              {farm.filter(p => !p.is_withered).length}
            </div>
            <div className="text-xs text-gray-600">Активных растений</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-600">
              {farm.filter(p => p.stage >= 3).length}
            </div>
            <div className="text-xs text-gray-600">Готово к сбору</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">
              {farm.filter(p => p.is_withered).length}
            </div>
            <div className="text-xs text-gray-600">Требуют полива</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {farm.filter(p => p.stage < 3 && !p.is_withered).length}
            </div>
            <div className="text-xs text-gray-600">Растут</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnimatedFarmGrid;