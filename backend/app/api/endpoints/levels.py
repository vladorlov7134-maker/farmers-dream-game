from fastapi import APIRouter

router = APIRouter()

# Простая реализация - можно заменить на данные из БД
LEVELS_CONFIG = [
    {"level": 1, "xp_required": 0, "unlocked_seeds": [1]},
    {"level": 2, "xp_required": 100, "unlocked_seeds": [1, 2]},
    {"level": 3, "xp_required": 300, "unlocked_seeds": [1, 2, 3]},
    {"level": 4, "xp_required": 600, "unlocked_seeds": [1, 2, 3, 4]},
    {"level": 5, "xp_required": 1000, "unlocked_seeds": [1, 2, 3, 4, 5]},
]

@router.get("/info/{user_id}")
async def get_level_info(user_id: int):
    """Получить информацию об уровне пользователя"""
    # В реальности тут нужно получить уровень пользователя из БД
    # Сейчас возвращаем заглушку для 1 уровня
    return {
        "current_level": 1,
        "current_xp": 0,
        "next_level_xp": LEVELS_CONFIG[1]["xp_required"],
        "progress_percentage": 0,
        "unlocked_seeds": LEVELS_CONFIG[0]["unlocked_seeds"]
    }