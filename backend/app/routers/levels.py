# backend/app/routers/levels.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict
from ..database import get_db
from ..models import GameEngine

router = APIRouter(prefix="/api/levels", tags=["levels"])


@router.get("/info/{player_id}")
async def get_level_info(
        player_id: int,
        db: Session = Depends(get_db)
) -> Dict:
    """Получить информацию об уровне игрока"""
    engine = GameEngine(db)
    return engine.get_level_info(player_id)


@router.post("/add-xp/{player_id}")
async def add_player_xp(
        player_id: int,
        amount: int,
        action_type: str = None,
        db: Session = Depends(get_db)
) -> Dict:
    """Добавить XP игроку"""
    engine = GameEngine(db)
    result = engine.add_xp(player_id, amount, action_type)

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])

    return result


@router.get("/leaderboard")
async def get_level_leaderboard(
        limit: int = 10,
        db: Session = Depends(get_db)
) -> Dict:
    """Получить таблицу лидеров по уровням"""
    from ..models import Player, PlayerLevel
    from sqlalchemy import desc

    leaderboard = db.query(
        Player.telegram_id,
        Player.username,
        PlayerLevel.current_level,
        PlayerLevel.total_xp
    ).join(PlayerLevel).filter(
        PlayerLevel.current_level > 1
    ).order_by(
        desc(PlayerLevel.current_level),
        desc(PlayerLevel.total_xp)
    ).limit(limit).all()

    return {
        "leaderboard": [
            {
                "telegram_id": row[0],
                "username": row[1] or f"User_{row[0]}",
                "level": row[2],
                "total_xp": row[3],
                "rank": idx + 1
            }
            for idx, row in enumerate(leaderboard)
        ]
    }


@router.get("/config")
async def get_levels_config() -> Dict:
    """Получить конфигурацию всех уровней"""
    from ..models import LevelConfig
    return {"levels": LevelConfig.LEVELS}