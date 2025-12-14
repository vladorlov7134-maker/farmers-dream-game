// frontend/src/types/game.types.ts

export interface Plant {
  id: string;
  type: string;
  stage: number;
  planted_at: string;
  last_watered: string;
  is_withered: boolean;
  position: { x: number; y: number };
}

export interface Inventory {
  seeds: Record<string, number>;
  harvest: Record<string, number>;
}

export interface Player {
  id: number;
  coins: number;
  diamonds: number;
  experience: number;
  level: number;
  created_at: string;
}

export interface LevelInfo {
  current_level: number;
  current_xp: number;
  xp_to_next_level: number;
  unlocked_plants: string[];
  unlocked_features: string[];
  // Добавляем недостающие поля
  next_level_xp?: number;
  progress_percentage?: number;
  next_level_rewards?: {
    coins?: number;
    diamonds?: number;
    new_plants?: string[];
  };
}

export interface LevelUpData {
  new_level: number;
  unlocked_plants?: string[];
  unlocked_features?: string[];
  reward_coins?: number;
  reward_diamonds?: number;
  // Добавляем недостающие поля
  old_level?: number;
  rewards?: {
    coins?: number;
    diamonds?: number;
    new_plants?: string[];
  };
}

export interface PlantInfo {
  type: string;
  seed_price: number;
  sell_price: number;
  growth_time: number;
  required_level: number;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic';
  description?: string;
}

export interface GameState {
  player: Player;
  farm: Plant[];
  inventory: Inventory;
  last_updated: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  xp?: number;
  coins?: number;
  diamonds?: number;
}

// ... остальные интерфейсы без изменений