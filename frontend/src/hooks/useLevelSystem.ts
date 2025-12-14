import { useState, useCallback } from 'react';
import axios from 'axios';
import { LevelInfo, LevelUpData } from '../types/game.types';
import { API_BASE } from '../config';

export const useLevelSystem = (playerId: number) => {
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);
  const [levelUpData, setLevelUpData] = useState<LevelUpData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchLevelInfo = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/levels/${playerId}`);
      const levelData = response.data;

      setLevelInfo({
        current_level: levelData.current_level,
        current_xp: levelData.current_xp,
        xp_to_next_level: levelData.xp_to_next_level,
        unlocked_plants: levelData.unlocked_plants || [],
        unlocked_features: levelData.unlocked_features || []
      });

      if (levelData.level_up) {
        setLevelUpData({
          old_level: levelData.old_level,
          new_level: levelData.new_level,
          rewards: {
            coins: levelData.reward_coins || 0,
            diamonds: levelData.reward_diamonds,
            unlocked_plants: levelData.unlocked_plants,
            unlocked_features: levelData.unlocked_features
          }
        });
      }
    } catch (error) {
      console.error('Error fetching level info:', error);
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  const addXP = useCallback(async (xp: number) => {
    try {
      await axios.post(`${API_BASE}/api/levels/add-xp`, {
        playerId,
        xp
      });
      await fetchLevelInfo();
    } catch (error) {
      console.error('Error adding XP:', error);
    }
  }, [playerId, fetchLevelInfo]);

  const closeLevelUpModal = useCallback(() => {
    setLevelUpData(null);
  }, []);

  return {
    levelInfo,
    levelUpData,
    loading,
    fetchLevelInfo,
    addXP,
    closeLevelUpModal
  };
};