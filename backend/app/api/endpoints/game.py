from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app import crud, schemas

router = APIRouter()


@router.get("/state/{user_id}")
async def get_game_state(
        user_id: int,
        db: Session = Depends(deps.get_db),
        current_user: dict = Depends(deps.verify_telegram_data)
):
    """Получить состояние игры для пользователя (ферма, инвентарь, уровень)"""
    # Проверяем, что пользователь запрашивает свои данные
    if current_user["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Получаем данные пользователя
    user = crud.user.get(db, id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Получаем ферму
    farm = crud.farm.get_by_user(db, user_id=user_id)
    if not farm:
        farm = crud.farm.create_for_user(db, user_id=user_id)

    # Получаем инвентарь
    inventory = crud.inventory.get_by_user(db, user_id=user_id)

    # Формируем ответ
    return {
        "user": {
            "id": user.id,
            "username": user.username,
            "level": user.level,
            "xp": user.xp,
            "coins": user.coins
        },
        "farm": {
            "cells": farm.cells,  # Массив 5x5 с растениями
            "last_update": farm.updated_at
        },
        "inventory": [
            {"seed_id": item.seed_id, "count": item.count}
            for item in inventory
        ] if inventory else []
    }


@router.get("/plants_info")
async def get_plants_info(db: Session = Depends(deps.get_db)):
    """Получить информацию о всех типах растений"""
    plants = crud.seed.get_all(db)
    return [
        {
            "id": plant.id,
            "name": plant.name,
            "emoji": plant.emoji,
            "growth_time": plant.growth_time,
            "reward_xp": plant.reward_xp,
            "reward_coins": plant.reward_coins,
            "price": plant.price
        }
        for plant in plants
    ]