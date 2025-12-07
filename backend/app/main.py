from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import time
import os

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
async def root():
    return {
        "message": "🌱 Farmers Dream API работает!",
        "status": "online",
        "version": "1.0.0",
        "timestamp": time.time()
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "farmers-dream-api",
        "timestamp": time.time()
    }

@app.get("/api/plants_info")
async def plants_info():
    return {
        "plants": [
            {
                "type": "carrot",
                "name": "Морковь",
                "emoji": "🥕",
                "seed_price": 10,
                "sell_price": 5,
                "growth_time": 60,
                "unlocked": True,
                "required_level": 1,
                "rarity": "common"
            },
            {
                "type": "tomato",
                "name": "Помидор",
                "emoji": "🍅",
                "seed_price": 20,
                "sell_price": 10,
                "growth_time": 120,
                "unlocked": True,
                "required_level": 2,
                "rarity": "common"
            }
        ]
    }

@app.get("/api/levels/info/{player_id}")
async def level_info(player_id: int):
    return {
        "current_level": 3,
        "current_xp": 250,
        "total_xp": 750,
        "next_level_xp": 150,
        "progress_percentage": 62.5,
        "unlocked_features": ["basic_planting", "watering", "selling"],
        "next_level_rewards": {"coins": 500, "seeds": 5},
        "unlocked_plants": ["carrot", "tomato"]
    }

@app.get("/api/game/state/{player_id}")
async def game_state(player_id: int):
    import random
    return {
        "game_state": {
            "player": {
                "id": 1,
                "telegram_id": player_id,
                "username": f"player_{player_id}",
                "coins": 1500,
                "diamonds": 10
            },
            "level": {
                "current_level": 3,
                "current_xp": 250,
                "total_xp": 750,
                "next_level_xp": 150,
                "progress_percentage": 62.5,
                "unlocked_features": ["basic_planting", "watering", "selling"],
                "next_level_rewards": {"coins": 500, "seeds": 5},
                "unlocked_plants": ["carrot", "tomato"]
            },
            "inventory": {
                "coins": 1500,
                "diamonds": 10,
                "seeds": {"carrot": 15, "tomato": 8},
                "harvest": {"carrot": 10, "tomato": 5}
            },
            "farm": [
                {
                    "x": x,
                    "y": y,
                    "is_watered": random.random() > 0.5,
                    "has_fertilizer": random.random() > 0.8,
                    "plant": {
                        "id": f"plant_{x}_{y}",
                        "type": random.choice(["carrot", "tomato"]),
                        "stage": "growing",
                        "emoji": random.choice(["🥕", "🍅"]),
                        "progress": random.uniform(0.1, 0.9),
                        "time_to_next_stage": random.randint(100, 600),
                        "can_harvest": random.random() > 0.7,
                        "planted_at": time.time() - random.randint(1000, 10000)
                    } if random.random() > 0.3 else None
                }
                for x in range(5) for y in range(5)
            ],
            "farm_size": 5,
            "game_time": 3600
        }
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)