// frontend/src/components/LevelSystem/LevelProgress.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Star, Award, Zap } from 'lucide-react';
import { LevelInfo } from '../../types/game.types';

interface LevelProgressProps {
  levelInfo: LevelInfo;
  onAddXP?: (xp: number) => void;
}

const LevelProgress: React.FC<LevelProgressProps> = ({ levelInfo, onAddXP }) => {
  // Вычисляем значения на основе данных
  const progressPercentage = (levelInfo.current_xp / levelInfo.xp_to_next_level) * 100;
  const xpNeeded = levelInfo.xp_to_next_level - levelInfo.current_xp;

  const quickActions = [
    { xp: 10, label: '🌱 Посадить семя', emoji: '🌱' },
    { xp: 25, label: '💧 Полить растение', emoji: '💧' },
    { xp: 50, label: '💰 Продать урожай', emoji: '💰' },
    { xp: 100, label: '🎯 Задание дня', emoji: '🎯' },
  ];

  const handleAddXP = (xp: number) => {
    if (onAddXP) {
      onAddXP(xp);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 flex items-center">
            <Star className="w-7 h-7 text-yellow-500 mr-3" />
            Уровень {levelInfo.current_level}
          </h3>
          <p className="text-gray-600 mt-1">
            Собрано {levelInfo.current_xp} из {levelInfo.xp_to_next_level} XP
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-blue-600">{progressPercentage.toFixed(1)}%</div>
          <p className="text-sm text-gray-500">Прогресс</p>
        </div>
      </div>

      {/* Прогресс бар */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{levelInfo.current_xp} XP</span>
          <span>Осталось: {xpNeeded} XP</span>
          <span>{levelInfo.xp_to_next_level} XP</span>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
          />
        </div>
      </div>

      {/* Разблокированные растения */}
      {levelInfo.unlocked_plants && levelInfo.unlocked_plants.length > 0 && (
        <div className="mb-6">
          <h4 className="font-bold text-gray-700 mb-3 flex items-center">
            <Award className="w-5 h-5 mr-2 text-green-500" />
            Разблокированные растения
          </h4>
          <div className="flex flex-wrap gap-2">
            {levelInfo.unlocked_plants.map((plant, index) => (
              <div
                key={index}
                className="px-3 py-1.5 bg-green-100 text-green-800 rounded-lg text-sm font-medium"
              >
                {plant === 'carrot' && '🥕 Морковь'}
                {plant === 'tomato' && '🍅 Помидор'}
                {plant === 'cucumber' && '🥒 Огурец'}
                {plant === 'strawberry' && '🍓 Клубника'}
                {plant === 'pumpkin' && '🎃 Тыква'}
                {!['carrot', 'tomato', 'cucumber', 'strawberry', 'pumpkin'].includes(plant) && plant}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Быстрые действия для получения XP */}
      {onAddXP && (
        <div>
          <h4 className="font-bold text-gray-700 mb-3 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-yellow-500" />
            Быстрый рост уровня
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map((action, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAddXP(action.xp)}
                className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition text-center"
              >
                <div className="text-2xl mb-1">{action.emoji}</div>
                <div className="font-bold text-gray-800">+{action.xp} XP</div>
                <div className="text-xs text-gray-600 mt-1">{action.label}</div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Советы */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl">
        <p className="text-blue-800 text-sm">
          💡 Совет: Чем выше уровень, тем больше растений и возможностей открывается!
          Выполняйте ежедневные задания для быстрого роста уровня.
        </p>
      </div>
    </div>
  );
};

export default LevelProgress;