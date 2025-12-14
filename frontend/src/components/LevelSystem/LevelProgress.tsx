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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Star className="w-8 h-8 text-yellow-500" />
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Уровень {levelInfo.current_level}</h3>
            <p className="text-gray-600">Прогресс до следующего уровня</p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-3xl font-bold text-purple-600">
            {levelInfo.current_xp}/{nextLevelXp}
          </div>
          <div className="text-gray-500">XP</div>
        </div>
      </div>

      {/* Прогресс бар */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Текущий XP: {levelInfo.current_xp}</span>
          <span>Осталось: {nextLevelXp - levelInfo.current_xp} XP</span>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          ></div>
        </div>
        <div className="text-center mt-2 text-sm text-gray-500">
          {progressPercentage.toFixed(1)}% завершено
        </div>
      </div>

      {/* Награды за следующий уровень */}
      {nextLevelRewards && (
        <div className="mb-6 p-4 bg-white rounded-xl border">
          <h4 className="font-bold text-gray-700 mb-3 flex items-center">
            <Gift className="w-5 h-5 mr-2 text-pink-500" />
            Награды за уровень {levelInfo.current_level + 1}
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {nextLevelRewards.coins && (
              <div className="flex items-center p-2 bg-yellow-50 rounded-lg">
                <span className="font-bold text-yellow-700 mr-2">💰</span>
                <span className="text-sm">{nextLevelRewards.coins} монет</span>
              </div>
            )}
            {nextLevelRewards.diamonds && (
              <div className="flex items-center p-2 bg-blue-50 rounded-lg">
                <span className="font-bold text-blue-700 mr-2">💎</span>
                <span className="text-sm">{nextLevelRewards.diamonds} кристаллов</span>
              </div>
            )}
            {nextLevelRewards.new_plants && nextLevelRewards.new_plants.length > 0 && (
              <div className="col-span-2 flex items-center p-2 bg-green-50 rounded-lg">
                <span className="font-bold text-green-700 mr-2">🌱</span>
                <span className="text-sm">Новые растения: {nextLevelRewards.new_plants.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Разблокированные растения */}
      {levelInfo.unlocked_plants && levelInfo.unlocked_plants.length > 0 && (
        <div className="mb-6 p-4 bg-white rounded-xl border">
          <h4 className="font-bold text-gray-700 mb-3">🌿 Разблокированные растения</h4>
          <div className="flex flex-wrap gap-2">
            {levelInfo.unlocked_plants.map((plant, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
              >
                {plant}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Тестовая кнопка (только в разработке) */}
      {process.env.NODE_ENV === 'development' && onAddXP && (
        <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
          <h4 className="font-bold text-gray-700 mb-3 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-orange-500" />
            Тестовые действия (только разработка)
          </h4>
          <button
            onClick={handleAddTestXP}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-bold hover:opacity-90 transition"
          >
            +25 тестового XP
          </button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Эта кнопка видна только в режиме разработки
          </p>
        </div>
      )}
    </div>
  );
};

export default LevelProgress;