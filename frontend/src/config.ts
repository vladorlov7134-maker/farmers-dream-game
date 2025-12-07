// frontend/src/config.ts
// Для Vite используем import.meta.env
// Значения по умолчанию для разработки
const env = {
  VITE_API_URL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  VITE_BOT_USERNAME: import.meta.env.VITE_BOT_USERNAME || "farmers_dream_game_bot"
};

export const API_BASE = env.VITE_API_URL;
export const BOT_USERNAME = env.VITE_BOT_USERNAME;