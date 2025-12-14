// frontend/src/hooks/useLevelSystem.ts
import { useState, useCallback } from 'react';
import { API_BASE } from '../config';
import { LevelInfo, LevelUpData, AddXPRequest } from '../types/game.types';

// Начальные данные уровня
const DEFAULT_LEVEL_INFO: LevelInfo = {
  current_level: 1,
  current_xp: 0,
  xp_to_next_level: 100,
  unlocked_plants: ['carrot'],
  unlocked_features: []
};

export const useLevelSystem = (playerId: number) => {
  const [levelInfo, setLevelInfo] = useState<LevelInfo>(DEFAULT_LEVEL_INFO);
  const [levelUpData, setLevelUpData] = useState<LevelUpData | null>(null);

  const fetchLevelInfo = useCallback(async () => {
    try {
      // Пробуем получить данные с сервера
      const response = await fetch(`${API_BASE}/api/level/${playerId}`);

      if (response.ok) {
        const data = await response.json();
        setLevelInfo(data);
      } else {
        // Если эндпоинт не найден, используем локальные данные
        console.log('Level endpoint not found, using default level data');

        // Можно попробовать получить уровень из общего состояния игрока
        try {
          const playerResponse = await fetch(`${API_BASE}/api/player/${playerId}`);
          if (playerResponse.ok) {
            const playerData = await playerResponse.json();
            setLevelInfo({
              current_level: playerData.level || 1,
              current_xp: playerData.experience || 0,
              xp_to_next_level: 100, // Можно рассчитать
              unlocked_plants: ['carrot'], // Базовые растения
              unlocked_features: []
            });
          }
        } catch (playerError) {
          // Используем дефолтные данные
          setLevelInfo(DEFAULT_LEVEL_INFO);
        }
      }
    } catch (error) {
      console.error('Error fetching level info:', error);
      // Используем дефолтные данные при ошибке
      setLevelInfo(DEFAULT_LEVEL_INFO);
    }
  }, [playerId]);

  const addXP = useCallback(async (xpAmount: number) => {
    console.log('Adding XP:', xpAmount);

    try {
      // Пробуем отправить на сервер
      const response = await fetch(`${API_BASE}/api/level/add-xp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_id: playerId, xp_amount: xpAmount })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.level_up) {
          setLevelUpData(data.level_up_data);
        }
        // Обновляем локальные данные
        setLevelInfo(prev => {
          const newXP = prev.current_xp + xpAmount;
          let newLevel = prev.current_level;
          let xpToNext = prev.xp_to_next_level;

          // Проверяем уровень ап
          if (newXP >= xpToNext) {
            newLevel += 1;
            const remainingXP = newXP - xpToNext;

            // Симулируем уровень ап
            setLevelUpData({
              new_level: newLevel,
              unlocked_plants: newLevel >= 2 ? ['tomato'] : undefined,
              reward_coins: 50 * newLevel,
              reward_diamonds: newLevel >= 3 ? 5 : 0
            });

            return {
              ...prev,
              current_level: newLevel,
              current_xp: remainingXP,
              xp_to_next_level: 100 * newLevel, // Увеличиваем требование
              unlocked_plants: newLevel >= 2 ? [...prev.unlocked_plants, 'tomato'] : prev.unlocked_plants
            };
          }

          return {
            ...prev,
            current_xp: newXP
          };
        });
      } else {
        // Если сервер не отвечает, обновляем локально
        console.log('Level XP endpoint not found, updating locally');
        setLevelInfo(prev => {
          const newXP = prev.current_xp + xpAmount;
          let newLevel = prev.current_level;
          let xpToNext = prev.xp_to_next_level;

          // Проверяем уровень ап
          if (newXP >= xpToNext) {
            newLevel += 1;
            const remainingXP = newXP - xpToNext;

            // Симулируем уровень ап
            setLevelUpData({
              new_level: newLevel,
              unlocked_plants: newLevel >= 2 ? ['tomato'] : undefined,
              reward_coins: 50 * newLevel,
              reward_diamonds: newLevel >= 3 ? 5 : 0
            });

            return {
              ...prev,
              current_level: newLevel,
              current_xp: remainingXP,
              xp_to_next_level: 100 * newLevel,
              unlocked_plants: newLevel >= 2 ? [...prev.unlocked_plants, 'tomato'] : prev.unlocked_plants
            };
          }

          return {
            ...prev,
            current_xp: newXP
          };
        });
      }
    } catch (error) {
      console.error('Error adding XP:', error);
      // Обновляем локально при ошибке
      setLevelInfo(prev => ({
        ...prev,
        current_xp: prev.current_xp + xpAmount
      }));
    }
  }, [playerId]);

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