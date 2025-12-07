# backend/app/main.py
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse
from sqlalchemy.orm import Session
from typing import Dict, List, Optional
import time
import logging
import os

from .database import SessionLocal, engine, Base
from .models import Player, PlayerLevel, Inventory, LevelConfig
from .game_logic import GameEngine
from .routers import game, levels

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Создание таблиц
Base.metadata.create_all(bind=engine)

# Создание FastAPI приложения
app = FastAPI(
    title="Farmers Dream API",
    description="API для игры Farmers Dream с системой уровней",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене указать конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Зависимость для получения сессии БД
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Подключение роутеров
app.include_router(game.router, prefix="/api")
app.include_router(levels.router, prefix="/api")

# Глобальный объект игрового движка
game_engine = None


@app.on_event("startup")
async def startup_event():
    """Инициализация при запуске"""
    global game_engine
    db = SessionLocal()
    game_engine = GameEngine(db)
    logger.info("Farmers Dream API запущен с системой уровней!")


# ==================== ОСНОВНЫЕ API ЭНДПОИНТЫ ====================

@app.get("/")
async def root():
    """Корневой эндпоинт"""
    return {
        "message": "🌱 Farmers Dream API с системой уровней",
        "version": "2.0.0",
        "features": [
            "Игровая ферма 5x5",
            "Система уровней и XP",
            "Награды за повышение уровня",
            "Открытие нового контента",
            "Инвентарь и магазин",
            "Telegram WebApp интеграция"
        ],
        "endpoints": {
            "game": "/api/game",
            "levels": "/api/levels",
            "docs": "/docs"
        }
    }


@app.get("/health")
async def health_check():
    """Проверка здоровья сервиса"""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "service": "farmers-dream-api"
    }


@app.get("/api/init/{telegram_id}")
async def init_player(
        telegram_id: int,
        username: Optional[str] = None,
        db: Session = Depends(get_db)
):
    """Инициализация нового игрока"""
    try:
        # Проверяем, существует ли игрок
        player = db.query(Player).filter(Player.telegram_id == telegram_id).first()

        if not player:
            # Создаем нового игрока
            player = Player(
                telegram_id=telegram_id,
                username=username,
                coins=1000,
                diamonds=5,
                created_at=time.time(),
                last_active=time.time()
            )
            db.add(player)
            db.commit()
            db.refresh(player)

            # Создаем уровень игрока
            player_level = PlayerLevel(
                player_id=player.id,
                current_level=1,
                current_xp=0,
                total_xp=0,
                created_at=time.time(),
                updated_at=time.time()
            )
            db.add(player_level)

            # Создаем инвентарь
            inventory = Inventory(
                player_id=player.id,
                seeds={"carrot": 10, "tomato": 5},
                harvest={}
            )
            db.add(inventory)

            db.commit()

            logger.info(f"Новый игрок создан: {telegram_id}")

            return {
                "success": True,
                "message": "Игрок создан",
                "player_id": player.id,
                "is_new": True
            }
        else:
            # Обновляем время последней активности
            player.last_active = time.time()
            db.commit()

            return {
                "success": True,
                "message": "Игрок уже существует",
                "player_id": player.id,
                "is_new": False
            }

    except Exception as e:
        db.rollback()
        logger.error(f"Error initializing player: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/game/state/{telegram_id}")
async def get_game_state(
        telegram_id: int,
        db: Session = Depends(get_db)
):
    """Получить полное состояние игры для игрока"""
    try:
        player = db.query(Player).filter(Player.telegram_id == telegram_id).first()
        if not player:
            raise HTTPException(status_code=404, detail="Player not found")

        # Получаем уровень игрока
        player_level = db.query(PlayerLevel).filter(
            PlayerLevel.player_id == player.id
        ).first()

        if not player_level:
            player_level = PlayerLevel(
                player_id=player.id,
                current_level=1,
                current_xp=0,
                total_xp=0,
                created_at=time.time(),
                updated_at=time.time()
            )
            db.add(player_level)
            db.commit()

        # Получаем инвентарь
        inventory = db.query(Inventory).filter(
            Inventory.player_id == player.id
        ).first()

        if not inventory:
            inventory = Inventory(
                player_id=player.id,
                seeds={"carrot": 10, "tomato": 5},
                harvest={}
            )
            db.add(inventory)
            db.commit()

        # Создаем игровой движок для получения состояния фермы
        engine = GameEngine(db)
        farm_state = engine.get_farm_state(player.id)

        # Информация об уровне
        level_info = {
            "current_level": player_level.current_level,
            "current_xp": player_level.current_xp,
            "total_xp": player_level.total_xp,
            "next_level_xp": player_level.get_next_level_xp(),
            "progress_percentage": player_level.get_progress_percentage(),
            "unlocked_features": player_level.get_unlocked_features(),
            "next_level_rewards": LevelConfig.get_config(player_level.current_level + 1).get("rewards", {})
            if LevelConfig.get_config(player_level.current_level + 1)
            else {},
            "unlocked_plants": LevelConfig.get_unlocked_plants(player_level.current_level)
        }

        # Полное состояние игры
        game_state = {
            "player": {
                "id": player.id,
                "telegram_id": player.telegram_id,
                "username": player.username,
                "coins": player.coins,
                "diamonds": player.diamonds
            },
            "level": level_info,
            "inventory": {
                "coins": player.coins,
                "diamonds": player.diamonds,
                "seeds": inventory.seeds if inventory.seeds else {},
                "harvest": inventory.harvest if inventory.harvest else {}
            },
            "farm": farm_state,
            "farm_size": 5,
            "game_time": time.time() - player.created_at
        }

        return JSONResponse(content={
            "success": True,
            "game_state": game_state
        })

    except Exception as e:
        logger.error(f"Error getting game state: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/game/plant")
async def plant_seed(
        request: Request,
        db: Session = Depends(get_db)
):
    """Посадить семя с начислением XP"""
    try:
        data = await request.json()
        telegram_id = data.get("telegram_id")
        plant_type = data.get("plant_type")
        position = data.get("position")

        if not all([telegram_id, plant_type, position]):
            raise HTTPException(status_code=400, detail="Missing required fields")

        player = db.query(Player).filter(Player.telegram_id == telegram_id).first()
        if not player:
            raise HTTPException(status_code=404, detail="Player not found")

        engine = GameEngine(db)

        # Проверяем уровень для доступа к растению
        player_level = db.query(PlayerLevel).filter(
            PlayerLevel.player_id == player.id
        ).first()

        if not player_level:
            player_level = PlayerLevel(
                player_id=player.id,
                current_level=1,
                current_xp=0,
                total_xp=0
            )
            db.add(player_level)
            db.commit()

        unlocked_plants = LevelConfig.get_unlocked_plants(player_level.current_level)
        if plant_type not in unlocked_plants:
            # Находим нужный уровень для этого растения
            required_level = 1
            for config in LevelConfig.LEVELS:
                if plant_type in config.get("unlocked_plants", []):
                    required_level = config["level"]
                    break

            return JSONResponse(content={
                "success": False,
                "error": f"Растение откроется на уровне {required_level}"
            })

        # Сажаем растение
        result = engine.plant_seed_with_xp(player.id, plant_type, position)

        return JSONResponse(content=result)

    except Exception as e:
        logger.error(f"Error planting seed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/game/harvest")
async def harvest_plant(
        request: Request,
        db: Session = Depends(get_db)
):
    """Собрать урожай с начислением XP"""
    try:
        data = await request.json()
        telegram_id = data.get("telegram_id")
        plant_id = data.get("plant_id")

        if not all([telegram_id, plant_id]):
            raise HTTPException(status_code=400, detail="Missing required fields")

        player = db.query(Player).filter(Player.telegram_id == telegram_id).first()
        if not player:
            raise HTTPException(status_code=404, detail="Player not found")

        engine = GameEngine(db)
        result = engine.harvest_with_xp(player.id, plant_id)

        return JSONResponse(content=result)

    except Exception as e:
        logger.error(f"Error harvesting plant: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/game/water")
async def water_plant(
        request: Request,
        db: Session = Depends(get_db)
):
    """Полить растение с начислением XP"""
    try:
        data = await request.json()
        telegram_id = data.get("telegram_id")
        x = data.get("x")
        y = data.get("y")

        if not all([telegram_id, x is not None, y is not None]):
            raise HTTPException(status_code=400, detail="Missing required fields")

        player = db.query(Player).filter(Player.telegram_id == telegram_id).first()
        if not player:
            raise HTTPException(status_code=404, detail="Player not found")

        engine = GameEngine(db)

        # Проверяем, есть ли растение на клетке
        # В реальной реализации здесь должна быть логика проверки

        # Добавляем XP за полив
        xp_result = engine.add_xp(player.id, 2, "watering")

        # В реальной реализации здесь должна быть логика обновления состояния полива

        return JSONResponse(content={
            "success": True,
            "message": "Растение полито",
            "xp_gained": 2,
            "level_up": xp_result.get("level_up", False),
            "level_data": xp_result if xp_result.get("level_up") else None
        })

    except Exception as e:
        logger.error(f"Error watering plant: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/game/buy")
async def buy_seeds(
        request: Request,
        db: Session = Depends(get_db)
):
    """Купить семена"""
    try:
        data = await request.json()
        telegram_id = data.get("telegram_id")
        plant_type = data.get("plant_type")
        amount = data.get("amount", 1)

        if not all([telegram_id, plant_type]):
            raise HTTPException(status_code=400, detail="Missing required fields")

        player = db.query(Player).filter(Player.telegram_id == telegram_id).first()
        if not player:
            raise HTTPException(status_code=404, detail="Player not found")

        # Получаем информацию о растении
        plant_info = get_plant_info(plant_type)
        if not plant_info:
            raise HTTPException(status_code=400, detail="Unknown plant type")

        # Проверяем уровень для доступа к растению
        player_level = db.query(PlayerLevel).filter(
            PlayerLevel.player_id == player.id
        ).first()

        if not player_level:
            player_level = PlayerLevel(
                player_id=player.id,
                current_level=1,
                current_xp=0,
                total_xp=0
            )
            db.add(player_level)
            db.commit()

        unlocked_plants = LevelConfig.get_unlocked_plants(player_level.current_level)
        if plant_type not in unlocked_plants:
            # Находим нужный уровень для этого растения
            required_level = 1
            for config in LevelConfig.LEVELS:
                if plant_type in config.get("unlocked_plants", []):
                    required_level = config["level"]
                    break

            return JSONResponse(content={
                "success": False,
                "error": f"Семена откроются на уровне {required_level}"
            })

        # Проверяем стоимость
        total_price = plant_info["seed_price"] * amount
        if player.coins < total_price:
            return JSONResponse(content={
                "success": False,
                "error": "Недостаточно монет"
            })

        # Списываем монеты
        player.coins -= total_price

        # Добавляем семена в инвентарь
        inventory = db.query(Inventory).filter(
            Inventory.player_id == player.id
        ).first()

        if not inventory:
            inventory = Inventory(player_id=player.id, seeds={}, harvest={})
            db.add(inventory)

        current_seeds = inventory.seeds if inventory.seeds else {}
        current_seeds[plant_type] = current_seeds.get(plant_type, 0) + amount
        inventory.seeds = current_seeds

        db.commit()

        return JSONResponse(content={
            "success": True,
            "plant_type": plant_type,
            "amount": amount,
            "total_price": total_price,
            "new_balance": player.coins
        })

    except Exception as e:
        logger.error(f"Error buying seeds: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/game/sell")
async def sell_harvest(
        request: Request,
        db: Session = Depends(get_db)
):
    """Продать урожай с начислением XP"""
    try:
        data = await request.json()
        telegram_id = data.get("telegram_id")
        plant_type = data.get("plant_type")
        amount = data.get("amount", 1)

        if not all([telegram_id, plant_type]):
            raise HTTPException(status_code=400, detail="Missing required fields")

        player = db.query(Player).filter(Player.telegram_id == telegram_id).first()
        if not player:
            raise HTTPException(status_code=404, detail="Player not found")

        # Проверяем, открыта ли функция продажи
        player_level = db.query(PlayerLevel).filter(
            PlayerLevel.player_id == player.id
        ).first()

        if not player_level:
            player_level = PlayerLevel(
                player_id=player.id,
                current_level=1,
                current_xp=0,
                total_xp=0
            )
            db.add(player_level)
            db.commit()

        unlocked_features = player_level.get_unlocked_features()
        if "selling" not in unlocked_features:
            return JSONResponse(content={
                "success": False,
                "error": "Функция продажи откроется на 2 уровне"
            })

        # Проверяем наличие урожая
        inventory = db.query(Inventory).filter(
            Inventory.player_id == player.id
        ).first()

        if not inventory or not inventory.harvest:
            return JSONResponse(content={
                "success": False,
                "error": "Нет урожая"
            })

        current_harvest = inventory.harvest if inventory.harvest else {}
        if current_harvest.get(plant_type, 0) < amount:
            return JSONResponse(content={
                "success": False,
                "error": "Недостаточно урожая"
            })

        # Получаем информацию о растении для цены
        plant_info = get_plant_info(plant_type)
        if not plant_info:
            raise HTTPException(status_code=400, detail="Unknown plant type")

        # Рассчитываем доход
        price_per_unit = plant_info["sell_price"]
        total_price = price_per_unit * amount

        # Добавляем монеты
        player.coins += total_price

        # Убираем урожай из инвентаря
        current_harvest[plant_type] = current_harvest.get(plant_type, 0) - amount
        if current_harvest[plant_type] <= 0:
            del current_harvest[plant_type]

        inventory.harvest = current_harvest

        # Добавляем XP за продажу
        engine = GameEngine(db)
        xp_per_unit = {
            "carrot": 1,
            "tomato": 2,
            "cucumber": 3,
            "strawberry": 4,
            "pumpkin": 10
        }.get(plant_type, 1)

        xp_amount = xp_per_unit * amount
        xp_result = engine.add_xp(player.id, xp_amount, "selling")

        db.commit()

        return JSONResponse(content={
            "success": True,
            "plant_type": plant_type,
            "amount": amount,
            "total_price": total_price,
            "xp_gained": xp_amount,
            "new_balance": player.coins,
            "level_up": xp_result.get("level_up", False),
            "level_data": xp_result if xp_result.get("level_up") else None
        })

    except Exception as e:
        logger.error(f"Error selling harvest: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/plants_info")
async def get_plants_info():
    """Получить информацию о всех растениях"""
    try:
        plants = []

        for plant_type in ["carrot", "tomato", "cucumber", "strawberry", "pumpkin"]:
            info = get_plant_info(plant_type)
            if info:
                # Определяем нужный уровень для разблокировки
                required_level = 1
                for config in LevelConfig.LEVELS:
                    if plant_type in config.get("unlocked_plants", []):
                        required_level = config["level"]
                        break

                info["required_level"] = required_level
                plants.append(info)

        return JSONResponse(content={
            "success": True,
            "plants": plants
        })

    except Exception as e:
        logger.error(f"Error getting plants info: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/game/update")
async def update_game_state(
        request: Request,
        db: Session = Depends(get_db)
):
    """Обновить состояние игры"""
    try:
        data = await request.json()
        telegram_id = data.get("telegram_id")

        if not telegram_id:
            raise HTTPException(status_code=400, detail="Missing telegram_id")

        player = db.query(Player).filter(Player.telegram_id == telegram_id).first()
        if not player:
            raise HTTPException(status_code=404, detail="Player not found")

        engine = GameEngine(db)
        updated_plants = engine.update_plants(player.id)

        # Получаем обновленное состояние игры
        from .routers.game import get_game_state
        game_state = await get_game_state(telegram_id, db)

        return JSONResponse(content={
            "success": True,
            "updated_plants": updated_plants,
            "game_state": game_state["game_state"]
        })

    except Exception as e:
        logger.error(f"Error updating game: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== TELEGRAM WEBAPP INTEGRATION ====================

@app.get("/webapp")
async def serve_webapp():
    """Страница для Telegram WebApp"""
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Farmers Dream 🌱</title>
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
        <style>
            body {
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
            }

            .container {
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                color: white;
                text-align: center;
            }

            .logo {
                font-size: 48px;
                margin-bottom: 20px;
            }

            .button {
                background: white;
                color: #667eea;
                padding: 15px 30px;
                border-radius: 25px;
                text-decoration: none;
                font-weight: bold;
                display: inline-block;
                margin: 10px;
                transition: transform 0.2s;
            }

            .button:hover {
                transform: translateY(-2px);
            }

            .features {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin: 40px 0;
            }

            .feature {
                background: rgba(255, 255, 255, 0.1);
                padding: 20px;
                border-radius: 15px;
                backdrop-filter: blur(10px);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">🌱</div>
            <h1>Farmers Dream</h1>
            <p>Управляй своей фермой прямо в Telegram!</p>

            <div class="features">
                <div class="feature">
                    <h3>🏆 Система уровней</h3>
                    <p>Повышай уровень, открывай новые растения</p>
                </div>
                <div class="feature">
                    <h3>🌾 Выращивай растения</h3>
                    <p>Сажай, поливай, собирай урожай</p>
                </div>
                <div class="feature">
                    <h3>💰 Продавай урожай</h3>
                    <p>Зарабатывай монеты и улучшай ферму</p>
                </div>
            </div>

            <a href="#" class="button" onclick="launchGame()">🎮 Начать игру</a>
            <a href="https://t.me/farmers_dream_game_bot" class="button">🤖 Открыть бота</a>
        </div>

        <script>
            function launchGame() {
                if (window.Telegram && Telegram.WebApp) {
                    Telegram.WebApp.ready();
                    Telegram.WebApp.expand();

                    // Получаем данные пользователя
                    const user = Telegram.WebApp.initDataUnsafe.user;
                    if (user) {
                        // Перенаправляем в игру с данными пользователя
                        window.location.href = `/play?tg_id=${user.id}&username=${user.username || ''}`;
                    } else {
                        window.location.href = "/play";
                    }
                } else {
                    window.location.href = "/play";
                }
            }

            // Автозапуск если в URL есть параметр auto
            if (window.location.search.includes('auto=true')) {
                launchGame();
            }
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)


# ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================

def get_plant_info(plant_type: str) -> Optional[Dict]:
    """Получить информацию о растении"""
    plants_config = {
        "carrot": {
            "type": "carrot",
            "name": "Морковь",
            "emoji": "🥕",
            "growth_time": 60,
            "seed_price": 10,
            "sell_price": 5,
            "yield_range": [2, 4],
            "rarity": "common"
        },
        "tomato": {
            "type": "tomato",
            "name": "Помидор",
            "emoji": "🍅",
            "growth_time": 120,
            "seed_price": 20,
            "sell_price": 10,
            "yield_range": [1, 3],
            "rarity": "common"
        },
        "cucumber": {
            "type": "cucumber",
            "name": "Огурец",
            "emoji": "🥒",
            "growth_time": 150,
            "seed_price": 30,
            "sell_price": 15,
            "yield_range": [1, 2],
            "rarity": "uncommon"
        },
        "strawberry": {
            "type": "strawberry",
            "name": "Клубника",
            "emoji": "🍓",
            "growth_time": 180,
            "seed_price": 50,
            "sell_price": 8,
            "yield_range": [3, 6],
            "rarity": "rare"
        },
        "pumpkin": {
            "type": "pumpkin",
            "name": "Тыква",
            "emoji": "🎃",
            "growth_time": 300,
            "seed_price": 100,
            "sell_price": 50,
            "yield_range": [1, 1],
            "rarity": "epic"
        }
    }

    return plants_config.get(plant_type)


# ==================== ОБРАБОТКА ОШИБОК ====================

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Обработчик HTTP исключений"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "path": request.url.path
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Обработчик общих исключений"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "message": str(exc)
        }
    )


# ==================== ЗАПУСК СЕРВЕРА ====================

if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")

    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True if os.getenv("ENVIRONMENT") == "development" else False,
        log_level="info"
    )