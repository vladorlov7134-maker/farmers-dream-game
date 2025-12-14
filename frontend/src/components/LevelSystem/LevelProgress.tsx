// frontend/src/components/LevelSystem/LevelProgress.tsx
import React from 'react';
import { LevelInfo } from '../../types/game.types';
import { Star, Zap, Gift } from 'lucide-react';

interface LevelProgressProps {
  levelInfo: LevelInfo;
  onAddXP?: (xpAmount: number) => Promise<void> | void;
}

const LevelProgress: React.FC<LevelProgressProps> = ({ levelInfo, onAddXP }) => {
  // Используем существующие поля или вычисляем
  const nextLevelXp = levelInfo.next_level_xp || levelInfo.xp_to_next_level;
  const progressPercentage = levelInfo.progress_percentage ||
    (levelInfo.current_xp / nextLevelXp) * 100;
  const nextLevelRewards = levelInfo.next_level_rewards || {};

  const handleAddTestXP = async () => {
    if (onAddXP) {
      await onAddXP(25);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-purple-200">
      {/* ... остальной код без изменений ... */}

      {/* Тестовая кнопка (без проверки process.env) */}
      {onAddXP && (
        <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
          <h4 className="font-bold text-gray-700 mb-3 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-orange-500" />
            Тестовые действия
          </h4>
          <button
            onClick={handleAddTestXP}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-bold hover:opacity-90 transition"
          >
            +25 тестового XP
          </button>
        </div>
      )}
    </div>
  );
};

export default LevelProgress;