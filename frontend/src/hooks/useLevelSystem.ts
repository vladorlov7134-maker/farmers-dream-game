// frontend/src/hooks/useLevelSystem.ts
import { useState, useCallback } from 'react';
import { API_BASE } from '../config';
import { LevelInfo, LevelUpData } from '../types/game.types'; // Убрали AddXPRequest

export const useLevelSystem = (playerId: number) => {
  const [levelInfo, setLevelInfo] = useState<LevelInfo>({
    current_level: 1,
    current_xp: 0,
    xp_to_next_level: 100,
    unlocked_plants: ['carrot'],
    unlocked_features: []
  });

  const [levelUpData, setLevelUpData] = useState<LevelUpData | null>(null);

  const fetchLevelInfo = useCallback(async () => {
    return levelInfo;
  }, [levelInfo]);

  const addXP = useCallback(async (xpAmount: number) => {
    console.log('Adding XP locally:', xpAmount);

    setLevelInfo(prev => {
      const newXP = prev.current_xp + xpAmount;
      let newLevel = prev.current_level;
      let xpToNext = prev.xp_to_next_level;

      if (newXP >= xpToNext) {
        newLevel += 1;
        const remainingXP = newXP - xpToNext;

        let newUnlockedPlants = [...prev.unlocked_plants];
        if (newLevel >= 2 && !newUnlockedPlants.includes('tomato')) {
          newUnlockedPlants.push('tomato');
        }
        if (newLevel >= 3 && !newUnlockedPlants.includes('cucumber')) {
          newUnlockedPlants.push('cucumber');
        }
        if (newLevel >= 4 && !newUnlockedPlants.includes('strawberry')) {
          newUnlockedPlants.push('strawberry');
        }
        if (newLevel >= 5 && !newUnlockedPlants.includes('pumpkin')) {
          newUnlockedPlants.push('pumpkin');
        }

        setLevelUpData({
  old_level: data.old_level,
  new_level: data.new_level,
  rewards: {
    coins: data.reward_coins || 0,
    diamonds: data.reward_diamonds,
    unlocked_plants: data.unlocked_plants,
    unlocked_features: data.unlocked_features
  }
});

        return {
          ...prev,
          current_level: newLevel,
          current_xp: remainingXP,
          xp_to_next_level: Math.round(xpToNext * 1.5),
          unlocked_plants: newUnlockedPlants
        };
      }

      return {
        ...prev,
        current_xp: newXP
      };
    });
  }, []);

  const closeLevelUpModal = useCallback(() => {
    setLevelUpData(null);
  }, []);

  return {
    levelInfo,
    levelUpData,
    fetchLevelInfo,
    addXP,
    closeLevelUpModal
  };
};