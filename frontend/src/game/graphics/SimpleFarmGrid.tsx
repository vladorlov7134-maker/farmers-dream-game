// frontend/src/game/graphics/SimpleFarmGrid.tsx
import React from 'react';
import { FarmCell } from '../../types/game.types';

interface SimpleFarmGridProps {
  farm: FarmCell[];
  onPlant: (position: { x: number; y: number }) => void;
  onHarvest: (plantId: string, position: { x: number; y: number }) => void;
  onWater: (x: number, y: number) => void;
  selectedSeed: string | null;
}

const SimpleFarmGrid: React.FC<SimpleFarmGridProps> = ({
  farm,
  onPlant,
  onHarvest,
  onWater,
  selectedSeed
}) => {
  const handleCellClick = (cell: FarmCell) => {
    if (cell.plant) {
      if (cell.plant.can_harvest) {
        onHarvest(cell.plant.id, { x: cell.x, y: cell.y });
      }
    } else {
      if (selectedSeed) {
        onPlant({ x: cell.x, y: cell.y });
      }
    }
  };

  const handleWaterClick = (e: React.MouseEvent, x: number, y: number) => {
    e.stopPropagation();
    onWater(x, y);
  };

  const getCellBackground = (cell: FarmCell) => {
    if (cell.plant) {
      if (cell.plant.can_harvest) {
        return 'bg-gradient-to-br from-yellow-100 to-yellow-300';
      } else if (cell.is_watered) {
        return 'bg-gradient-to-br from-blue-100 to-emerald-100';
      } else {
        return 'bg-gradient-to-br from-emerald-50 to-green-100';
      }
    }
    return 'bg-gradient-to-br from-amber-50 to-orange-50';
  };

  const getPlantStageText = (progress: number) => {
    if (progress < 0.1) return 'Семя';
    if (progress < 0.3) return 'Росток';
    if (progress < 0.7) return 'Растет';
    if (progress < 0.9) return 'Созревает';
    return 'Готово';
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-5 gap-2 md:gap-3">
        {farm.map((cell) => (
          <div
            key={`${cell.x}-${cell.y}`}
            className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center relative transition-all duration-300 cursor-pointer hover:scale-105 ${
              cell.plant 
                ? cell.plant.can_harvest 
                  ? 'border-yellow-400 shadow-lg' 
                  : 'border-green-300'
                : selectedSeed 
                  ? 'border-dashed border-blue-300 hover:border-blue-500' 
                  : 'border-amber-200'
            } ${getCellBackground(cell)}`}
            onClick={() => handleCellClick(cell)}
          >
            {/* Верхний индикатор - эмодзи растения */}
            <div className="text-3xl md:text-4xl">
              {cell.plant ? cell.plant.emoji : '🌱'}
            </div>

            {/* Индикаторы состояния */}
            <div className="absolute top-1 right-1 flex flex-col gap-1">
              {cell.is_watered && (
                <span className="text-blue-500 text-xs">💧</span>
              )}
              {cell.has_fertilizer && (
                <span className="text-green-500 text-xs">✨</span>
              )}
            </div>

            {/* Прогресс роста */}
            {cell.plant && (
              <>
                <div className="absolute bottom-8 left-2 right-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
                    style={{ width: `${cell.plant.progress * 100}%` }}
                  />
                </div>
                <div className="absolute bottom-2 text-xs font-medium">
                  {getPlantStageText(cell.plant.progress)}
                </div>
              </>
            )}

            {/* Кнопки действий */}
            {cell.plant && !cell.plant.can_harvest && !cell.is_watered && (
              <button
                onClick={(e) => handleWaterClick(e, cell.x, cell.y)}
                className="absolute bottom-1 right-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-lg hover:bg-blue-600 transition-colors"
              >
                💦 Полить
              </button>
            )}

            {!cell.plant && selectedSeed && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl opacity-0 hover:opacity-100 transition-opacity">
                <div className="text-white text-sm font-bold">Посадить</div>
              </div>
            )}

            {cell.plant?.can_harvest && (
              <div className="absolute inset-0 flex items-center justify-center bg-yellow-500/20 rounded-xl animate-pulse">
                <div className="text-yellow-800 text-sm font-bold">⚡ Собрать!</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Легенда */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded"></div>
          <span>Пустая клетка</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-br from-emerald-50 to-green-100 border border-green-300 rounded"></div>
          <span>Растет</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-br from-blue-100 to-emerald-100 border border-green-300 rounded"></div>
          <span>Полито</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-br from-yellow-100 to-yellow-300 border border-yellow-400 rounded"></div>
          <span>Готово к сбору</span>
        </div>
      </div>
    </div>
  );
};

export default SimpleFarmGrid;