// frontend/src/types/game.types.ts
export interface LevelInfo {
  current_level: number;
  current_xp: number;
  total_xp: number;
  next_level_xp: number;
  progress_percentage: number;
  unlocked_features: string[];
  next_level_rewards: Record<string, number>;
  unlocked_plants: string[];
}

export interface LevelUpData {
  level_up: boolean;
  old_level: number;
  new_level: number;
  rewards: Record<string, number>;
  xp_added: number;
}

export interface GameState {
  // Существующие поля...
  level: LevelInfo;
  inventory: {
    coins: number;
    diamonds: number;
    seeds: Record<string, number>;
    harvest: Record<string, number>;
  };
}

export interface PlantInfo {
  type: string;
  name: string;
  emoji: string;
  seed_price: number;
  sell_price: number;
  growth_time: number;
  unlocked: boolean;
  required_level: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
}