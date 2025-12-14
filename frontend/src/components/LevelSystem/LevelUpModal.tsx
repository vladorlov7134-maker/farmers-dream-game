// frontend/src/components/LevelSystem/LevelUpModal.tsx
import React from 'react';
import { LevelUpData } from '../../types/game.types';
import { Star, Trophy, Gift, Sparkles } from 'lucide-react';

interface LevelUpModalProps {
  levelData: LevelUpData;
  onClose: () => void;
}

const LevelUpModal: React.FC<LevelUpModalProps> = ({ levelData, onClose }) => {
  // Используем новые поля или старые
  const oldLevel = levelData.old_level || (levelData.new_level - 1);
  const rewards = levelData.rewards || {
    coins: levelData.reward_coins,
    diamonds: levelData.reward_diamonds,
    new_plants: levelData.unlocked_plants
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-gradient-to-b from-yellow-50 to-amber-100 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
        {/* Конфетти эффект (визуальный) */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400"></div>

        <div className="p-8 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-4">
              <Trophy className="w-10 h-10 text-white" />
            </div>

            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="text-3xl font-bold text-gray-700">{oldLevel}</div>
              <Sparkles className="w-8 h-8 text-yellow-500" />
              <div className="text-4xl font-bold text-orange-600">{levelData.new_level}</div>
            </div>

            <h2 className="text-3xl font-bold text-gray-800 mb-2">Уровень повышен!</h2>
            <p className="text-gray-600">Поздравляем с новым достижением!</p>
          </div>

          {/* Награды */}
          <div className="mb-8">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center justify-center">
              <Gift className="w-5 h-5 mr-2 text-pink-500" />
              Полученные награды
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {rewards.coins && rewards.coins > 0 && (
                <div className="bg-yellow-50 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-yellow-600">💰 {rewards.coins}</div>
                  <div className="text-sm text-yellow-700">монет</div>
                </div>
              )}

              {rewards.diamonds && rewards.diamonds > 0 && (
                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">💎 {rewards.diamonds}</div>
                  <div className="text-sm text-blue-700">кристаллов</div>
                </div>
              )}
            </div>

            {/* Новые растения */}
            {rewards.new_plants && rewards.new_plants.length > 0 && (
              <div className="mt-6">
                <h4 className="font-bold text-gray-700 mb-3">🌱 Новые разблокированные растения:</h4>
                <div className="flex flex-wrap justify-center gap-2">
                  {rewards.new_plants.map((plant, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-green-100 text-green-700 rounded-full font-medium"
                    >
                      {plant}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Новые функции */}
            {levelData.unlocked_features && levelData.unlocked_features.length > 0 && (
              <div className="mt-6">
                <h4 className="font-bold text-gray-700 mb-3">✨ Новые возможности:</h4>
                <ul className="text-left text-gray-600 space-y-2">
                  {levelData.unlocked_features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Star className="w-4 h-4 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Кнопка закрытия */}
          <button
            onClick={onClose}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg hover:opacity-90 transition"
          >
            Продолжить игру
          </button>

          <p className="text-sm text-gray-500 mt-4">
            Новые возможности уже доступны в игре!
          </p>
        </div>
      </div>
    </div>
  );
};

export default LevelUpModal;