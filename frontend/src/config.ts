// frontend/src/config.ts
// Прямой доступ к переменным окружения Vite
export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
export const BOT_USERNAME = import.meta.env.VITE_BOT_USERNAME || "farmers_dream_game_bot";
export const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT || "development";