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
  // Создаем сетку 5x5
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
    const baseEmoji = PLANT_EMOJIS[plant.type] || '🌱';
    return PLANT_STAGES[stageIndex];
  };

  const handleCellClick = (x: number, y: number, plant: Plant | null) => {
    if (plant) {
      if (plant.stage >= 3 && !plant.is_withered) {
        // Собрать урожай
        onHarvest(plant.id, { x, y });
      } else if (plant.is_withered) {
        // Полить завядшее растение
        onWater(x, y);
      }
    } else {
      // Посадить семя
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
    <div className="farm-grid">
      <div className="mb-4">
        <p className="text-gray-600">
          {selectedSeed ? `Выбрано: ${selectedSeed}` : 'Выберите семя для посадки'}
        </p>
      </div>

      <div className="grid grid-cols-5 gap-3 max-w-2xl mx-auto">
        {grid.map((cell, index) => (
          <div
            key={`${cell.x}-${cell.y}-${index}`}
            className={`
              relative w-16 h-16 border-2 rounded-lg flex items-center justify-center cursor-pointer
              transition-all duration-200 hover:scale-105 hover:shadow-md
              ${getCellClass(cell.plant, selectedSeed)}
            `}
            onClick={() => handleCellClick(cell.x, cell.y, cell.plant)}
            title={getTooltipText(cell.plant, selectedSeed)}
          >
            {cell.plant ? (
              <div className="text-center">
                <div className="text-2xl">
                  {getPlantStageEmoji(cell.plant)}
                </div>
                {cell.plant.is_withered && (
                  <div className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                    💧
                  </div>
                )}
                {cell.plant.stage >= 3 && !cell.plant.is_withered && (
                  <div className="absolute -top-1 -right-1 text-xs bg-yellow-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                    !
                  </div>
                )}
              </div>
            ) : selectedSeed ? (
              <div className="text-gray-400 text-lg">+</div>
            ) : (
              <div className="text-gray-300 text-lg">□</div>
            )}

            <div className="absolute bottom-0 left-0 text-xs text-gray-500 p-1">
              {cell.x},{cell.y}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="font-bold text-gray-700 mb-2">📋 Управление фермой:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
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