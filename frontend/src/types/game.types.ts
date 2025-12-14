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
}

export interface LevelUpData {
  new_level: number;
  unlocked_plants?: string[];
  unlocked_features?: string[];
  reward_coins?: number;
  reward_diamonds?: number;
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

export interface PlantSeedRequest {
  seed_type: string;
  position: { x: number; y: number };
}

export interface BuySeedRequest {
  seed_type: string;
  quantity: number;
}

export interface SellHarvestRequest {
  plant_type: string;
  quantity: number;
}

export interface WaterPlantRequest {
  x: number;
  y: number;
}

export interface AddXPRequest {
  player_id: number;
  xp_amount: number;
}

export interface TestAddCoinsRequest {
  player_id: number;
  amount: number;
}

// Типы для модальных окон
export interface ShopItem {
  type: string;
  name: string;
  price: number;
  rarity: string;
  unlocked: boolean;
  requiredLevel: number;
}

export interface SellItem {
  type: string;
  name: string;
  price: number;
  quantity: number;
  totalValue: number;
}

// Типы для компонентов
export interface FarmCell {
  x: number;
  y: number;
  plant: Plant | null;
  isEmpty: boolean;
}

export interface SeedItem {
  type: string;
  count: number;
  name: string;
  emoji: string;
}

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

// Константы
export const PLANT_TYPES = ['carrot', 'tomato', 'cucumber', 'strawberry', 'pumpkin'] as const;
export type PlantType = typeof PLANT_TYPES[number];

export const RARITY_TYPES = ['common', 'uncommon', 'rare', 'epic'] as const;
export type RarityType = typeof RARITY_TYPES[number];

// Утилитарные типы
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequireOnly<T, K extends keyof T> = Partial<Omit<T, K>> & Required<Pick<T, K>>;