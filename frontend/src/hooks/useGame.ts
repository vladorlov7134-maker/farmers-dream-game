// frontend/src/hooks/useGame.ts
import { useState, useCallback } from 'react';
import { GameState } from '../types/game.types';
import { API_BASE } from '../config';

export const useGame = (playerId: number) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);

  const fetchGameState = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/game/state/${playerId}`);
      if (!response.ok) throw new Error('Failed to fetch game state');

      const data = await response.json();
      setGameState(data.game_state);
      return data.game_state;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  const plantSeed = useCallback(async (plantType: string, position: { x: number, y: number }) => {
    try {
      const response = await fetch(`${API_BASE}/api/game/plant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: playerId,
          plant_type: plantType,
          position
        })
      });

      return await response.json();
    } catch (err) {
      return { success: false, error: 'Network error' };
    }
  }, [playerId]);

  const harvestPlant = useCallback(async (plantId: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/game/harvest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: playerId,
          plant_id: plantId
        })
      });
      return await response.json();
    } catch (err) {
      return { success: false, error: 'Network error' };
    }
  }, [playerId]);

  const waterPlant = useCallback(async (x: number, y: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/game/water`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: playerId,
          x,
          y
        })
      });
      return await response.json();
    } catch (err) {
      return { success: false, error: 'Network error' };
    }
  }, [playerId]);

  const buySeed = useCallback(async (plantType: string, amount: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/game/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: playerId,
          plant_type: plantType,
          amount
        })
      });
      return await response.json();
    } catch (err) {
      return { success: false, error: 'Network error' };
    }
  }, [playerId]);

  const sellHarvest = useCallback(async (plantType: string, amount: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/game/sell`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: playerId,
          plant_type: plantType,
          amount
        })
      });
      return await response.json();
    } catch (err) {
      return { success: false, error: 'Network error' };
    }
  }, [playerId]);

  return {
    loading,
    error,
    gameState,
    setGameState,
    fetchGameState,
    plantSeed,
    harvestPlant,
    waterPlant,
    buySeed,
    sellHarvest
  };
};