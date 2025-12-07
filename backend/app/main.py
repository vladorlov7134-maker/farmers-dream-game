from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from pydantic import BaseModel

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ====================== КОНФИГУРАЦИЯ ======================

# Используем SQLite для разработки (легко и быстро)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./farmers.db")

# Ваш Vercel URL (добавьте свой!)
VERCEL_URL = "https://farmers-dream-game-jrnmfganc-vladislavs-projects-509bdccb.vercel.app"

# ====================== БАЗА ДАННЫХ ======================

# Создаем движок базы данных
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # Только для SQLite
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ====================== МОДЕЛИ БД ======================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    telegram_id = Column(Integer, unique=True, index=True)
    username = Column(String, nullable=True)
    first_name = Column(String)
    balance = Column(Integer, default=100)
    experience = Column(Integer, default=0)
    level = Column(Integer, default=1)


class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    crop_type = Column(String)  # carrot, wheat, potato
    position_x = Column(Integer)
    position_y = Column(Integer)
    growth_stage = Column(Integer, default=1)  # 1-4 стадии
    planted_at = Column(String)  # ISO timestamp


# ====================== PYDANTIC SCHEMAS ======================

class UserCreate(BaseModel):
    telegram_id: int
    username: str | None = None
    first_name: str


class CropCreate(BaseModel):
    user_id: int
    crop_type: str
    position_x: int
    position_y: int


class CropUpdate(BaseModel):
    growth_stage: int


# ====================== LIFESPAN ======================

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("🚀 Starting Farmers Dream API...")
    logger.info(f"📊 Database: {DATABASE_URL}")
    logger.info(f"🌐 Vercel URL: {VERCEL_URL}")

    # Создаем таблицы
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Database tables created")

    yield

    # Shutdown
    logger.info("👋 Shutting down Farmers Dream API...")


# ====================== FASTAPI APP ======================

app = FastAPI(
    title="Farmers Dream API",
    version="1.0.0",
    description="Backend для фермерской игры в Telegram",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan
)

# ====================== CORS MIDDLEWARE ======================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # Локальная разработка
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",

        # Telegram
        "https://web.telegram.org",
        "https://oauth.telegram.org",

        # Vercel (основной домен и все поддомены)
        VERCEL_URL,
        "https://*.vercel.app",

        # Для разработки - можно разрешить все (осторожно в продакшене)
        "*"  # На время разработки
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"]
)


# ====================== DEPENDENCY ======================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ====================== ROOT ENDPOINTS ======================

@app.get("/")
async def root():
    """Корневой endpoint"""
    return {
        "message": "🌱 Farmers Dream API",
        "status": "running",
        "version": "1.0.0",
        "database": DATABASE_URL.split("://")[0],
        "vercel_url": VERCEL_URL,
        "docs": "/api/docs",
        "endpoints": [
            "/health",
            "/api/users",
            "/api/crops",
            "/api/plant",
            "/api/harvest"
        ]
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": "2025-12-07T02:00:00Z",
        "service": "farmers-dream-api"
    }


# ====================== API ENDPOINTS ======================

@app.get("/api/version")
async def get_version():
    """Версия API"""
    return {
        "version": "1.0.0",
        "game": "Farmers Dream",
        "author": "Vladislav"
    }


# ====================== USER ENDPOINTS ======================

@app.post("/api/users")
async def create_user(user: UserCreate):
    """Создание нового пользователя"""
    db = SessionLocal()
    try:
        # Проверяем, существует ли уже пользователь
        existing_user = db.query(User).filter(
            User.telegram_id == user.telegram_id
        ).first()

        if existing_user:
            return {
                "status": "exists",
                "user": {
                    "id": existing_user.id,
                    "telegram_id": existing_user.telegram_id,
                    "username": existing_user.username,
                    "first_name": existing_user.first_name,
                    "balance": existing_user.balance,
                    "experience": existing_user.experience,
                    "level": existing_user.level
                }
            }

        # Создаем нового пользователя
        db_user = User(
            telegram_id=user.telegram_id,
            username=user.username,
            first_name=user.first_name,
            balance=100,  # Стартовый баланс
            experience=0,
            level=1
        )

        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        return {
            "status": "created",
            "user": {
                "id": db_user.id,
                "telegram_id": db_user.telegram_id,
                "username": db_user.username,
                "first_name": db_user.first_name,
                "balance": db_user.balance,
                "experience": db_user.experience,
                "level": db_user.level
            }
        }
    except Exception as e:
        db.rollback()
        return {"status": "error", "message": str(e)}
    finally:
        db.close()


@app.get("/api/users/{telegram_id}")
async def get_user(telegram_id: int):
    """Получение пользователя по Telegram ID"""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.telegram_id == telegram_id).first()

        if not user:
            return {"status": "not_found"}

        return {
            "status": "found",
            "user": {
                "id": user.id,
                "telegram_id": user.telegram_id,
                "username": user.username,
                "first_name": user.first_name,
                "balance": user.balance,
                "experience": user.experience,
                "level": user.level
            }
        }
    finally:
        db.close()


# ====================== CROP ENDPOINTS ======================

@app.post("/api/crops")
async def plant_crop(crop: CropCreate):
    """Посадка растения"""
    db = SessionLocal()
    try:
        # Проверяем, свободна ли клетка
        existing_crop = db.query(Crop).filter(
            Crop.position_x == crop.position_x,
            Crop.position_y == crop.position_y,
            Crop.user_id == crop.user_id
        ).first()

        if existing_crop:
            return {"status": "error", "message": "Клетка уже занята"}

        # Создаем новое растение
        db_crop = Crop(
            user_id=crop.user_id,
            crop_type=crop.crop_type,
            position_x=crop.position_x,
            position_y=crop.position_y,
            growth_stage=1,
            planted_at="2025-12-07T00:00:00Z"  # TODO: использовать реальное время
        )

        db.add(db_crop)
        db.commit()
        db.refresh(db_crop)

        return {
            "status": "planted",
            "crop": {
                "id": db_crop.id,
                "crop_type": db_crop.crop_type,
                "position_x": db_crop.position_x,
                "position_y": db_crop.position_y,
                "growth_stage": db_crop.growth_stage,
                "planted_at": db_crop.planted_at
            }
        }
    except Exception as e:
        db.rollback()
        return {"status": "error", "message": str(e)}
    finally:
        db.close()


@app.get("/api/users/{user_id}/crops")
async def get_user_crops(user_id: int):
    """Получение всех растений пользователя"""
    db = SessionLocal()
    try:
        crops = db.query(Crop).filter(Crop.user_id == user_id).all()

        return {
            "status": "success",
            "count": len(crops),
            "crops": [
                {
                    "id": crop.id,
                    "crop_type": crop.crop_type,
                    "position_x": crop.position_x,
                    "position_y": crop.position_y,
                    "growth_stage": crop.growth_stage,
                    "planted_at": crop.planted_at
                }
                for crop in crops
            ]
        }
    finally:
        db.close()


@app.put("/api/crops/{crop_id}")
async def update_crop(crop_id: int, crop_update: CropUpdate):
    """Обновление стадии роста растения"""
    db = SessionLocal()
    try:
        crop = db.query(Crop).filter(Crop.id == crop_id).first()

        if not crop:
            return {"status": "error", "message": "Растение не найдено"}

        crop.growth_stage = crop_update.growth_stage
        db.commit()

        return {
            "status": "updated",
            "crop": {
                "id": crop.id,
                "growth_stage": crop.growth_stage
            }
        }
    except Exception as e:
        db.rollback()
        return {"status": "error", "message": str(e)}
    finally:
        db.close()


@app.delete("/api/crops/{crop_id}")
async def harvest_crop(crop_id: int):
    """Сбор урожая (удаление растения)"""
    db = SessionLocal()
    try:
        crop = db.query(Crop).filter(Crop.id == crop_id).first()

        if not crop:
            return {"status": "error", "message": "Растение не найдено"}

        # TODO: Добавить монеты пользователю за сбор

        db.delete(crop)
        db.commit()

        return {
            "status": "harvested",
            "crop_id": crop_id,
            "reward": 30  # Пример: 30 монет за морковь
        }
    except Exception as e:
        db.rollback()
        return {"status": "error", "message": str(e)}
    finally:
        db.close()


# ====================== GAME ENDPOINTS ======================

@app.get("/api/game/config")
async def get_game_config():
    """Конфигурация игры"""
    return {
        "farm_size": 5,
        "crop_types": [
            {
                "id": "carrot",
                "name": "Морковь",
                "price": 10,
                "sell_price": 30,
                "growth_time": 120,  # секунды
                "stages": 4
            },
            {
                "id": "wheat",
                "name": "Пшеница",
                "price": 20,
                "sell_price": 50,
                "growth_time": 180,
                "stages": 4
            },
            {
                "id": "potato",
                "name": "Картофель",
                "price": 15,
                "sell_price": 40,
                "growth_time": 150,
                "stages": 4
            }
        ],
        "starting_balance": 100,
        "starting_level": 1
    }


@app.post("/api/game/buy")
async def buy_item(item_type: str, user_id: int):
    """Покупка предмета в магазине"""
    # TODO: Реализовать логику покупки
    return {
        "status": "success",
        "item": item_type,
        "user_id": user_id,
        "message": f"Куплено: {item_type}"
    }


# ====================== TELEGRAM ENDPOINTS ======================

@app.post("/api/telegram/auth")
async def telegram_auth(telegram_data: dict):
    """Аутентификация через Telegram WebApp"""
    # TODO: Реализовать проверку подписи Telegram
    return {
        "status": "authenticated",
        "user_data": telegram_data.get("user"),
        "timestamp": "2025-12-07T02:00:00Z"
    }


# ====================== UTILITY ENDPOINTS ======================

@app.get("/api/debug")
async def debug_info():
    """Отладочная информация"""
    db = SessionLocal()
    try:
        user_count = db.query(User).count()
        crop_count = db.query(Crop).count()

        return {
            "users": user_count,
            "crops": crop_count,
            "database": DATABASE_URL,
            "cors_allowed_origins": [
                "http://localhost:5173",
                "https://web.telegram.org",
                VERCEL_URL,
                "https://*.vercel.app"
            ]
        }
    finally:
        db.close()


# ====================== ERROR HANDLERS ======================

@app.exception_handler(Exception)
async def universal_exception_handler(request, exc):
    """Обработчик всех исключений"""
    logger.error(f"Unhandled exception: {exc}")
    return {
        "status": "error",
        "message": str(exc),
        "endpoint": str(request.url)
    }


# ====================== ЗАПУСК СЕРВЕРА ======================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )