// frontend/src/game/graphics/SimpleFarmGrid.tsx (ИЗМЕНЕННАЯ СЕТКА)
import React from 'react';

interface Plant {
  id: string;
  type: string;
  stage: number;
  planted_at: string;
  last_watered: string;
  is_withered: boolean;
  position: { x: number; y: number };
}

interface SimpleFarmGridProps {
  farm: Plant[];
  onPlant: (position: { x: number; y: number }) => void;
  onHarvest: (plantId: string, position: { x: number; y: number }) => void;
  onWater: (x: number, y: number) => void;
  selectedSeed: string | null;
}

const PLANT_EMOJIS: Record<string, string> = {
  carrot: '🥕',
  tomato: '🍅',
  cucumber: '🥒',
  strawberry: '🍓',
  pumpkin: '🎃'
};

const PLANT_STAGES = ['🌱', '🌿', '🌾', '🪴'];

const SimpleFarmGrid: React.FC<SimpleFarmGridProps> = ({
  farm = [],
  onPlant,
  onHarvest,
  onWater,
  selectedSeed
}) => {
  const gridSize = 5;
  const grid = [];

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const plant = farm.find(p => p.position.x === x && p.position.y === y);
      grid.push({
        x,
        y,
        plant,
        isEmpty: !plant,
        isSelected: false
      });
    }
  }

  const getPlantStageEmoji = (plant: Plant) => {
    if (plant.is_withered) return '🥀';
    const stageIndex = Math.min(plant.stage, PLANT_STAGES.length - 1);
    return PLANT_STAGES[stageIndex];
  };

  const handleCellClick = (x: number, y: number, plant: Plant | null | undefined) => {
    const safePlant = plant || null;

    if (safePlant) {
      if (safePlant.stage >= 3 && !safePlant.is_withered) {
        onHarvest(safePlant.id, { x, y });
      } else if (safePlant.is_withered) {
        onWater(x, y);
      }
    } else {
      if (selectedSeed) {
        onPlant({ x, y });
      }
    }
  };

  const getCellClass = (plant: Plant | null, selectedSeed: string | null) => {
    if (plant) {
      if (plant.is_withered) return 'bg-red-50 border-red-300';
      if (plant.stage >= 3) return 'bg-yellow-50 border-yellow-400';
      return 'bg-green-50 border-green-300';
    }
    return selectedSeed ? 'bg-blue-50 border-blue-300 hover:bg-blue-100' : 'bg-gray-50 border-gray-300';
  };

  const getTooltipText = (plant: Plant | null, selectedSeed: string | null) => {
    if (plant) {
      if (plant.is_withered) return 'Завядшее растение (полить)';
      if (plant.stage >= 3) return 'Готово к сбору';
      return `Растет (стадия ${plant.stage + 1}/4)`;
    }
    return selectedSeed ? 'Кликните чтобы посадить' : 'Выберите семя для посадки';
  };

  return (
    <div className="farm-grid px-2 xs:px-4">
      <div className="mb-3 xs:mb-4">
        <p className="text-gray-600 text-sm xs:text-base">
          {selectedSeed ? `Выбрано: ${selectedSeed}` : 'Выберите семя для посадки'}
        </p>
      </div>

      {/* ИЗМЕНЕННАЯ СЕТКА - АДАПТИВНАЯ */}
      <div className="grid grid-cols-5 gap-1.5 xs:gap-2 sm:gap-3 w-full max-w-[280px] xs:max-w-[320px] sm:max-w-[400px] mx-auto">
        {grid.map((cell, index) => (
          <div
            key={`${cell.x}-${cell.y}-${index}`}
            className={`
              relative w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16
              border-2 rounded-lg flex items-center justify-center cursor-pointer
              transition-all duration-200 active:scale-95 hover:scale-105 hover:shadow-md
              ${getCellClass(cell.plant || null, selectedSeed)}
            `}
            onClick={() => handleCellClick(cell.x, cell.y, cell.plant || null)}
            title={getTooltipText(cell.plant || null, selectedSeed)}
          >
            {cell.plant ? (
              <div className="text-center">
                <div className="text-xl xs:text-2xl sm:text-3xl">
                  {getPlantStageEmoji(cell.plant)}
                </div>
                {cell.plant.is_withered && (
                  <div className="absolute -top-1 -right-1 text-[10px] xs:text-xs bg-red-500 text-white rounded-full w-3 h-3 xs:w-4 xs:h-4 flex items-center justify-center">
                    💧
                  </div>
                )}
                {cell.plant.stage >= 3 && !cell.plant.is_withered && (
                  <div className="absolute -top-1 -right-1 text-[10px] xs:text-xs bg-yellow-500 text-white rounded-full w-3 h-3 xs:w-4 xs:h-4 flex items-center justify-center">
                    !
                  </div>
                )}
              </div>
            ) : selectedSeed ? (
              <div className="text-gray-400 text-lg xs:text-xl">+</div>
            ) : (
              <div className="text-gray-300 text-lg xs:text-xl">□</div>
            )}

            <div className="absolute bottom-0 left-0 text-[8px] xs:text-[10px] sm:text-xs text-gray-500 p-0.5">
              {cell.x},{cell.y}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 xs:mt-6 p-3 xs:p-4 bg-gray-50 rounded-xl">
        <h4 className="font-bold text-gray-700 mb-2 text-sm xs:text-base">📋 Управление фермой:</h4>
        <ul className="text-xs xs:text-sm text-gray-600 space-y-1">
          <li className="flex items-center">
            <span className="w-6">🌱</span>
            <span>Пустая клетка - посадите семя</span>
          </li>
          <li className="flex items-center">
            <span className="w-6">🌿→🌾→🪴</span>
            <span>Растущее растение</span>
          </li>
          <li className="flex items-center">
            <span className="w-6 text-yellow-600">🪴</span>
            <span>Готово к сбору (кликните)</span>
          </li>
          <li className="flex items-center">
            <span className="w-6 text-red-600">🥀</span>
            <span>Завядшее растение (полить)</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SimpleFarmGrid;