// frontend/src/components/LevelSystem/LevelProgress.tsx
import React from 'react';
import { LevelInfo } from '../../types/game.types';

interface LevelProgressProps {
  levelInfo: LevelInfo;
  onToggle?: () => void;
  expanded?: boolean;
}

const LevelProgress: React.FC<LevelProgressProps> = ({
  levelInfo,
  onToggle,
  expanded = false
}) => {
  const {
    current_level,
    current_xp,
    next_level_xp,
    progress_percentage,
    unlocked_features,
    next_level_rewards
  } = levelInfo;

  const renderRewardIcon = (type: string, value: number) => {
    const icons: Record<string, string> = {
      coins: '🪙',
      diamonds: '💎',
      seeds: '🌱'
    };
    return (
      <div key={type} className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
        <span className="text-xl">{icons[type] || '🎁'}</span>
        <span className="font-bold">{value}</span>
      </div>
    );
  };

  return (
    <div
      className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl p-4 mb-4 shadow-xl cursor-pointer transition-transform hover:scale-[1.02]"
      onClick={onToggle}
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-3">
          <div className="bg-white/30 w-12 h-12 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold">🏆</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Уровень {current_level}</h3>
            <p className="text-white/80 text-sm">
              {current_xp} XP • До следующего: {next_level_xp} XP
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-white">{progress_percentage}%</span>
        </div>
      </div>

      {/* Прогресс бар */}
      <div className="mb-4">
        <div className="h-3 bg-white/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-cyan-400 rounded-full transition-all duration-500"
            style={{ width: `${progress_percentage}%` }}
          />
        </div>
      </div>

      {/* Расширенная информация */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-white/30 animate-slideDown">
          {unlocked_features.length > 0 && (
            <div className="mb-4">
              <h4 className="text-white font-semibold mb-2">Открытые возможности:</h4>
              <div className="flex flex-wrap gap-2">
                {unlocked_features.map((feature, idx) => (
                  <span
                    key={idx}
                    className="bg-white/20 text-white text-sm px-3 py-1 rounded-full"
                  >
                    {getFeatureName(feature)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {Object.keys(next_level_rewards).length > 0 && (
            <div>
              <h4 className="text-white font-semibold mb-2">Награды за следующий уровень:</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(next_level_rewards).map(([type, value]) =>
                  renderRewardIcon(type, value)
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Вспомогательная функция
const getFeatureName = (feature: string): string => {
  const names: Record<string, string> = {
    basic_planting: 'Посадка',
    watering: 'Полив',
    selling: 'Продажа',
    fertilizer: 'Удобрения',
    greenhouse_unlock: 'Теплица',
    greenhouse_build: 'Строительство',
    auto_watering: 'Автополив'
  };
  return names[feature] || feature;
};

export default LevelProgress;