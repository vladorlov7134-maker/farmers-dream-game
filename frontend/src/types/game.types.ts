export interface PlantInfo {
  type: string;
  seed_price: number;
  sell_price: number;
  growth_time: number;
  required_level: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
  description: string;
}

export interface Plant {
  id: string;
  type: string;
  stage: number;
  planted_at: string;
  last_watered: string;
  is_withered: boolean;
  position: { 
    x: number; 
    y: number;
    gardenId?: number;
  };
  gardenId?: number;
}

export interface Player {
  id: number;
  username: string;
  coins: number;
  diamonds: number;
  last_active: string;
}

export interface Inventory {
  seeds: Record<string, number>;
  harvest: Record<string, number>;
}

export interface GameState {
  farm: Plant[];
  player: Player;
  inventory: Inventory;
}

export interface LevelInfo {
  current_level: number;
  current_xp: number;
  xp_to_next_level: number;
  unlocked_plants: string[];
  unlocked_features: string[];
}

export interface LevelUpData {
  old_level: number;
  new_level: number;
  rewards: {
    coins: number;
    diamonds?: number;
    unlocked_plants?: string[];
    unlocked_features?: string[];
  };
}