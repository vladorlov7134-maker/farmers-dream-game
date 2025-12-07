// frontend/src/components/LevelSystem/UnlockedFeatures.tsx
import React from 'react';
import { LevelInfo } from '../../types/game.types';

interface UnlockedFeaturesProps {
  levelInfo: LevelInfo;
}

const UnlockedFeatures: React.FC<UnlockedFeaturesProps> = ({ levelInfo }) => {
  const { unlocked_features, unlocked_plants } = levelInfo;

  const getFeatureIcon = (feature: string): string => {
    const icons: Record<string, string> = {
      basic_planting: '🌱',
      watering: '💦',
      selling: '💰',
      fertilizer: '✨',
      greenhouse_unlock: '🏠',
      greenhouse_build: '🔨',
      auto_watering: '🤖'
    };
    return icons[feature] || '🔓';
  };

  const getPlantEmoji = (plant: string): string => {
    const emojis: Record<string, string> = {
      carrot: '🥕',
      tomato: '🍅',
      cucumber: '🥒',
      strawberry: '🍓',
      pumpkin: '🎃'
    };
    return emojis[plant] || '🌱';
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
      <h3 className="text-lg font-bold text-white mb-3">Открытый контент</h3>

      {unlocked_plants.length > 0 && (
        <div className="mb-4">
          <h4 className="text-white/80 font-medium mb-2">Растения:</h4>
          <div className="flex flex-wrap gap-2">
            {unlocked_plants.map((plant, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-green-900/30 text-green-300 px-3 py-2 rounded-lg"
              >
                <span className="text-xl">{getPlantEmoji(plant)}</span>
                <span className="font-medium">{getPlantName(plant)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {unlocked_features.length > 0 && (
        <div>
          <h4 className="text-white/80 font-medium mb-2">Возможности:</h4>
          <div className="grid grid-cols-2 gap-2">
            {unlocked_features.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-blue-900/30 text-blue-300 px-3 py-2 rounded-lg"
              >
                <span className="text-xl">{getFeatureIcon(feature)}</span>
                <span className="font-medium">{getFeatureName(feature)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Вспомогательные функции
const getPlantName = (plant: string): string => {
  const names: Record<string, string> = {
    carrot: 'Морковь',
    tomato: 'Помидор',
    cucumber: 'Огурец',
    strawberry: 'Клубника',
    pumpkin: 'Тыква'
  };
  return names[plant] || plant;
};

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

export default UnlockedFeatures;