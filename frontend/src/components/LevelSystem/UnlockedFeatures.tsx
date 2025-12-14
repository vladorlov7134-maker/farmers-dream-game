// src/components/LevelSystem/UnlockedFeatures.tsx
import React from 'react';
import { LevelInfo } from '../../types/game.types';

interface UnlockedFeaturesProps {
  levelInfo: LevelInfo | null;
}

const UnlockedFeatures: React.FC<UnlockedFeaturesProps> = ({ levelInfo }) => {
  // ✅ Защита от null/undefined
  if (!levelInfo) {
    console.log('UnlockedFeatures: levelInfo is null');
    return null;
  }

  if (!levelInfo.unlocked_features) {
    console.log('UnlockedFeatures: unlocked_features is missing');
    return null;
  }

  const { unlocked_features } = levelInfo;

  return (
    <div className="fixed bottom-24 right-4 bg-white p-4 rounded-xl shadow-lg max-w-xs border border-green-200">
      <h3 className="font-bold text-gray-800 mb-2">🎯 Разблокировано</h3>
      <ul className="space-y-1">
        {unlocked_features.map((feature: string, index: number) => (
          <li key={index} className="text-sm text-gray-600 flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UnlockedFeatures;