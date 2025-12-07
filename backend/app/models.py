# backend/app/models.py
from sqlalchemy import Column, Integer, String, Float, Boolean, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from typing import Optional, Dict, List
import time

Base = declarative_base()


class PlayerLevel(Base):
    """Модель уровня игрока"""
    __tablename__ = "player_levels"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"), unique=True, index=True)
    current_level = Column(Integer, default=1)
    current_xp = Column(Integer, default=0)
    total_xp = Column(Integer, default=0)
    created_at = Column(Float, default=time.time)
    updated_at = Column(Float, default=time.time)

    # Связи
    player = relationship("Player", back_populates="level")
    achievements = relationship("Achievement", back_populates="level")

    def to_dict(self) -> Dict:
        return {
            "current_level": self.current_level,
            "current_xp": self.current_xp,
            "total_xp": self.total_xp,
            "next_level_xp": self.get_next_level_xp(),
            "progress_percentage": self.get_progress_percentage(),
            "unlocked_features": self.get_unlocked_features()
        }

    def get_next_level_xp(self) -> int:
        """XP необходимые для следующего уровня"""
        level_config = LevelConfig.get_config(self.current_level)
        if level_config:
            return max(0, level_config.xp_required - self.current_xp)
        return 0

    def get_progress_percentage(self) -> float:
        """Процент прогресса до следующего уровня"""
        current_config = LevelConfig.get_config(self.current_level)
        next_config = LevelConfig.get_config(self.current_level + 1)

        if not next_config:
            return 100.0

        xp_in_current = self.current_xp - current_config.xp_required
        xp_needed = next_config.xp_required - current_config.xp_required

        if xp_needed <= 0:
            return 100.0

        return round((xp_in_current / xp_needed) * 100, 1)

    def get_unlocked_features(self) -> List[str]:
        """Получить все разблокированные функции"""
        return LevelConfig.get_unlocked_features(self.current_level)


class LevelConfig:
    """Конфигурация уровней (статический класс)"""

    LEVELS = [
        {
            "level": 1,
            "xp_required": 0,
            "rewards": {"coins": 100, "diamonds": 1},
            "unlocked_plants": ["carrot"],
            "unlocked_features": ["basic_planting", "watering"]
        },
        {
            "level": 2,
            "xp_required": 100,
            "rewards": {"coins": 200, "seeds": 5},
            "unlocked_plants": ["tomato"],
            "unlocked_features": ["selling"]
        },
        {
            "level": 3,
            "xp_required": 300,
            "rewards": {"coins": 500, "diamonds": 2},
            "unlocked_plants": ["cucumber"],
            "unlocked_features": ["fertilizer"]
        },
        {
            "level": 4,
            "xp_required": 600,
            "rewards": {"coins": 1000, "seeds": 10},
            "unlocked_plants": ["strawberry"],
            "unlocked_features": ["greenhouse_unlock"]
        },
        {
            "level": 5,
            "xp_required": 1000,
            "rewards": {"coins": 2000, "diamonds": 3},
            "unlocked_plants": ["pumpkin"],
            "unlocked_features": ["greenhouse_build"]
        }
    ]

    @classmethod
    def get_config(cls, level: int) -> Optional[Dict]:
        """Получить конфиг уровня"""
        for config in cls.LEVELS:
            if config["level"] == level:
                return config
        return None

    @classmethod
    def get_unlocked_features(cls, level: int) -> List[str]:
        """Получить все разблокированные функции до уровня"""
        features = []
        for config in cls.LEVELS:
            if config["level"] <= level:
                features.extend(config["unlocked_features"])
        return list(set(features))

    @classmethod
    def get_unlocked_plants(cls, level: int) -> List[str]:
        """Получить все разблокированные растения до уровня"""
        plants = []
        for config in cls.LEVELS:
            if config["level"] <= level:
                plants.extend(config["unlocked_plants"])
        return list(set(plants))


class Achievement(Base):
    """Достижения игрока"""
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    player_level_id = Column(Integer, ForeignKey("player_levels.id"))
    name = Column(String)
    description = Column(String)
    unlocked_at = Column(Float)
    reward = Column(JSON)  # {"coins": 100, "diamonds": 5}

    # Связи
    level = relationship("PlayerLevel", back_populates="achievements")


class Player(Base):
    """Основная модель игрока"""
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    telegram_id = Column(Integer, unique=True, index=True)
    username = Column(String, nullable=True)
    coins = Column(Integer, default=1000)
    diamonds = Column(Integer, default=5)
    created_at = Column(Float, default=time.time)
    last_active = Column(Float, default=time.time)

    # Связи
    level = relationship("PlayerLevel", back_populates="player", uselist=False)
    inventory = relationship("Inventory", back_populates="player", uselist=False)


class Inventory(Base):
    """Инвентарь игрока"""
    __tablename__ = "inventories"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"), unique=True)
    seeds = Column(JSON, default={})  # {"carrot": 10, "tomato": 5}
    harvest = Column(JSON, default={})  # {"carrot": 5, "tomato": 3}

    # Связи
    player = relationship("Player", back_populates="inventory")