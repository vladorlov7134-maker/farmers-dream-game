from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os

# Создаем приложение
app = FastAPI(title="Farmers Dream API", version="1.0.0")

# Настройка CORS - разрешаем все для теста
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене заменить на конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Модели данных
class Plant(BaseModel):
    id: int
    name: str
    growth_stage: int = 0
    price: int


class GameState(BaseModel):
    user_id: int
    money: int = 100
    level: int = 1
    plants: List[Plant] = []


# "База данных" в памяти для теста
fake_db = {
    1: GameState(
        user_id=1,
        money=100,
        level=1,
        plants=[
            Plant(id=1, name="Carrot", growth_stage=1, price=10),
            Plant(id=2, name="Tomato", growth_stage=0, price=20)
        ]
    )
}


# Маршруты API
@app.get("/")
async def root():
    return {"message": "Farmers Dream API is running!", "status": "ok"}


@app.get("/api/")
async def api_root():
    return {"api": "v1", "endpoints": ["/api/game/{user_id}", "/api/health"]}


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "farmers-dream-api"}


@app.get("/api/game/{user_id}")
async def get_game_state(user_id: int):
    """Получить состояние игры для пользователя"""
    if user_id not in fake_db:
        # Создаем нового пользователя
        fake_db[user_id] = GameState(user_id=user_id)

    return fake_db[user_id]


@app.post("/api/game/{user_id}/plant")
async def plant_seed(user_id: int, plant_name: str):
    """Посадить новое растение"""
    if user_id not in fake_db:
        raise HTTPException(status_code=404, detail="User not found")

    game_state = fake_db[user_id]
    new_plant = Plant(
        id=len(game_state.plants) + 1,
        name=plant_name,
        growth_stage=0,
        price=10
    )
    game_state.plants.append(new_plant)
    game_state.money -= 5  # Стоимость посадки

    return {"message": f"Planted {plant_name}", "plant": new_plant, "money": game_state.money}


@app.put("/api/game/{user_id}/plant/{plant_id}/water")
async def water_plant(user_id: int, plant_id: int):
    """Полить растение"""
    if user_id not in fake_db:
        raise HTTPException(status_code=404, detail="User not found")

    game_state = fake_db[user_id]
    for plant in game_state.plants:
        if plant.id == plant_id:
            plant.growth_stage = min(plant.growth_stage + 1, 3)  # Макс 3 стадии
            return {"message": f"Plant {plant_id} watered", "growth_stage": plant.growth_stage}

    raise HTTPException(status_code=404, detail="Plant not found")


# Информация о сервере
@app.get("/api/info")
async def server_info():
    return {
        "python_version": os.sys.version,
        "environment": os.getenv("RENDER", "development"),
        "api_url": "https://farmers-dream-api-new.onrender.com"
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=10000)