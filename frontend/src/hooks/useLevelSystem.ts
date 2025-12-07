// frontend/src/hooks/useLevelSystem.ts
import { useState, useCallback } from 'react';
import { LevelInfo, LevelUpData } from '../types/game.types';
import { API_BASE } from '../config';

export const useLevelSystem = (playerId: number) => {
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);
  const [levelUpData, setLevelUpData] = useState<LevelUpData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLevelInfo = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/levels/info/${playerId}`);
      if (!response.ok) throw new Error('Failed to fetch level info');

      const data = await response.json();
      setLevelInfo(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  const addXP = useCallback(async (amount: number, actionType?: string) => {
    try {
      const response = await fetch(`${API_BASE}/levels/add-xp/${playerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, action_type: actionType })
      });

      if (!response.ok) throw new Error('Failed to add XP');

      const data = await response.json();

      if (data.level_up) {
        setLevelUpData(data);
      }

      // Обновляем информацию об уровне
      await fetchLevelInfo();

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, [playerId, fetchLevelInfo]);

  const closeLevelUpModal = useCallback(() => {
    setLevelUpData(null);
  }, []);

  return {
    levelInfo,
    levelUpData,
    loading,
    error,
    fetchLevelInfo,
    addXP,
    closeLevelUpModal
  };
};