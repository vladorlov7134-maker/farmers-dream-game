// frontend/src/hooks/useGame.ts
import { useState, useCallback } from 'react';
import { GameState, Plant } from '../types/game.types';
import { API_BASE } from '../config';

export const useGame = (playerId: number) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);

  const fetchGameState = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/game/${playerId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setGameState(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
      console.error('Error fetching game state:', err);
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  const plantSeed = useCallback(async (seedType: string, position: { x: number; y: number; gardenId?: number }) => {
    try {
      const response = await fetch(`${API_BASE}/api/farm/plant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId,
          seedType,
          position
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка посадки');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Ошибка посадки'
      };
    }
  }, [playerId]);

  const harvestPlant = useCallback(async (plantId: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/farm/harvest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plantId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка сбора');
      }

      const data = await response.json();
      return {
        success: true,
        data,
        xp: data.xp || 0
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Ошибка сбора'
      };
    }
  }, []);

  const waterPlant = useCallback(async (x: number, y: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/farm/water`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ x, y })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка полива');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Ошибка полива'
      };
    }
  }, []);

  const buySeed = useCallback(async (seedType: string, quantity: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/shop/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId,
          seedType,
          quantity
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка покупки');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Ошибка покупки'
      };
    }
  }, [playerId]);

  const sellHarvest = useCallback(async (plantType: string, quantity: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/shop/sell`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId,
          plantType,
          quantity
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка продажи');
      }

      const data = await response.json();
      return {
        success: true,
        data,
        xp: data.xp || 0
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Ошибка продажи'
      };
    }
  }, [playerId]);

  return {
    loading,
    error,
    gameState,
    fetchGameState,
    plantSeed,
    harvestPlant,
    waterPlant,
    buySeed,
    sellHarvest
  };
};