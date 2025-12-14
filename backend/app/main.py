from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Farmers Dream API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Farmers Dream API is running"}


@app.get("/api")
def api_root():
    return {
        "endpoints": {
            "game": "/api/game",
            "plants": "/api/plants",
            "levels": "/api/levels"
        }
    }


# Простые endpoint'ы для теста
@app.get("/api/game/state/{user_id}")
def get_game_state(user_id: int):
    """Получить состояние игры для пользователя"""
    return {
        "user_id": user_id,
        "level": 1,
        "xp": 0,
        "coins": 1000,
        "gems": 10,
        "farm": [[0] * 5 for _ in range(5)],
        "seeds": {
            "carrot": 5,
            "tomato": 3,
            "cucumber": 2
        },
        "harvest": {
            "carrot": 2,
            "tomato": 1
        }
    }


@app.get("/api/plants/info")
def get_plants_info():
    """Получить информацию о растениях"""
    return {
        "plants": [
            {
                "id": 1,
                "name": "Пшеница",
                "key": "carrot",
                "growth_time": 60,
                "price": 10,
                "sell_price": 15
            },
            {
                "id": 2,
                "name": "Морковь",
                "key": "tomato",
                "growth_time": 120,
                "price": 20,
                "sell_price": 30
            },
            {
                "id": 3,
                "name": "Помидор",
                "key": "cucumber",
                "growth_time": 180,
                "price": 30,
                "sell_price": 45
            },
            {
                "id": 4,
                "name": "Огурец",
                "key": "strawberry",
                "growth_time": 240,
                "price": 40,
                "sell_price": 60
            },
            {
                "id": 5,
                "name": "Клубника",
                "key": "pumpkin",
                "growth_time": 300,
                "price": 50,
                "sell_price": 75
            }
        ]
    }


@app.get("/api/levels/info/{level_id}")
def get_level_info(level_id: int):
    """Получить информацию об уровне"""
    # Маппинг растений по ID
    plant_names = {
        1: "Пшеница",
        2: "Морковь",
        3: "Помидор",
        4: "Огурец",
        5: "Клубника"
    }

    # Определяем разблокированные фичи по уровню
    if level_id == 1:
        unlocked_plants = [1]
        features = ["Базовая ферма", "Пшеница", "Магазин семян"]
    elif level_id == 2:
        unlocked_plants = [1, 2]
        features = ["Морковь", "Расширенный инвентарь", "Система полива"]
    elif level_id == 3:
        unlocked_plants = [1, 2, 3]
        features = ["Помидор", "Автополив", "Удобрения"]
    elif level_id == 4:
        unlocked_plants = [1, 2, 3, 4]
        features = ["Огурец", "Теплица", "Система ирригации"]
    elif level_id == 5:
        unlocked_plants = [1, 2, 3, 4, 5]
        features = ["Клубника", "Ферма 6x6", "Сборщик урожая"]
    else:
        unlocked_plants = [1, 2, 3, 4, 5]
        features = [f"Уровень {level_id} фичи", "Расширенные возможности"]

    return {
        "level": level_id,
        "currentLevel": level_id,
        "required_xp": level_id * 100,
        "current_xp": 0,
        "unlocked_features": features,
        "unlocked_plants": unlocked_plants,
        "plant_names": [plant_names.get(pid, f"Растение {pid}") for pid in unlocked_plants]
    }


# Алиас для совместимости со старым фронтендом (если нужно)
@app.get("/api/levels/info/{level_id}/legacy")
def get_level_info_legacy(level_id: int):
    """Старая версия с русскими полями"""
    return {
        "уровень": level_id,
        "требуемый_опыт": level_id * 100,
        "разблокированные_растения": [1] if level_id == 1 else [1, 2]
    }


# Алиас для plants_info (если фронтенд ещё использует)
@app.get("/api/plants_info")
def get_plants_info_alias():
    """Алиас для совместимости"""
    return {
        "plants": [
            {
                "id": 1,
                "name": "Пшеница",
                "key": "carrot",
                "growth_time": 60,
                "price": 10,
                "sell_price": 15
            },
            {
                "id": 2,
                "name": "Морковь",
                "key": "tomato",
                "growth_time": 120,
                "price": 20,
                "sell_price": 30
            }
        ]
    }


# Дополнительные endpoint'ы для игровых действий
@app.post("/api/game/plant/{user_id}/{row}/{col}/{plant_type}")
def plant_seed(user_id: int, row: int, col: int, plant_type: str):
    """Посадить семя"""
    return {
        "success": True,
        "message": f"Семя {plant_type} посажено на клетку ({row}, {col})",
        "xp": 10
    }


@app.post("/api/game/harvest/{user_id}/{row}/{col}")
def harvest_plant(user_id: int, row: int, col: int):
    """Собрать урожай"""
    return {
        "success": True,
        "message": f"Урожай собран с клетки ({row}, {col})",
        "xp": 25,
        "coins": 50
    }


@app.post("/api/game/water/{user_id}/{row}/{col}")
def water_plant(user_id: int, row: int, col: int):
    """Полить растение"""
    return {
        "success": True,
        "message": f"Растение на клетке ({row}, {col}) полито"
    }


@app.post("/api/shop/buy/{user_id}/{seed_type}/{quantity}")
def buy_seed(user_id: int, seed_type: str, quantity: int):
    """Купить семена"""
    return {
        "success": True,
        "message": f"Куплено {quantity} семян {seed_type}",
        "coins_spent": quantity * 10
    }


@app.post("/api/shop/sell/{user_id}/{plant_type}/{quantity}")
def sell_harvest(user_id: int, plant_type: str, quantity: int):
    """Продать урожай"""
    return {
        "success": True,
        "message": f"Продано {quantity} урожая {plant_type}",
        "coins_earned": quantity * 15,
        "xp": quantity * 5
    }