from fastapi import APIRouter
from app.api.endpoints import users, farm, game, levels  # Добавляем импорт

api_router = APIRouter()

# Подключаем существующие роутеры
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(farm.router, prefix="/farm", tags=["farm"])

# ДОБАВЛЯЕМ НОВЫЕ РОУТЕРЫ
api_router.include_router(game.router, prefix="/game", tags=["game"])
api_router.include_router(levels.router, prefix="/levels", tags=["levels"])

# И другие существующие роутеры...