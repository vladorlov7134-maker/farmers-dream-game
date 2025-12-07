# backend/app/game_logic.py
from typing import Dict, List, Optional, Tuple
from .models import Player, PlayerLevel, LevelConfig, Inventory, Base
from sqlalchemy.orm import Session
import time
import random


class GameEngine:
    def __init__(self, db: Session):
        self.db = db

    def add_xp(self, player_id: int, amount: int, action_type: str = None) -> Dict:
        """Добавить XP игроку"""
        player = self.db.query(Player).filter(Player.id == player_id).first()
        if not player:
            return {"success": False, "error": "Player not found"}

        # Получаем или создаем уровень игрока
        player_level = self.db.query(PlayerLevel).filter(
            PlayerLevel.player_id == player_id
        ).first()

        if not player_level:
            player_level = PlayerLevel(
                player_id=player_id,
                current_level=1,
                current_xp=0,
                total_xp=0
            )
            self.db.add(player_level)
            self.db.commit()

        old_level = player_level.current_level
        player_level.current_xp += amount
        player_level.total_xp += amount
        player_level.updated_at = time.time()

        # Проверяем повышение уровня
        new_level = self._calculate_level(player_level.current_xp)
        level_up = new_level > old_level

        result = {
            "success": True,
            "xp_added": amount,
            "old_level": old_level,
            "new_level": new_level,
            "level_up": level_up,
            "rewards": {}
        }

        if level_up:
            player_level.current_level = new_level
            # Награды за все полученные уровни
            for level in range(old_level + 1, new_level + 1):
                config = LevelConfig.get_config(level)
                if config and "rewards" in config:
                    for reward_type, value in config["rewards"].items():
                        result["rewards"][reward_type] = result["rewards"].get(reward_type, 0) + value

            # Применяем награды
            self._apply_rewards(player, result["rewards"])

        self.db.commit()
        return result

    def _calculate_level(self, xp: int) -> int:
        """Рассчитать уровень на основе XP"""
        for config in reversed(LevelConfig.LEVELS):
            if xp >= config["xp_required"]:
                return config["level"]
        return 1

    def _apply_rewards(self, player: Player, rewards: Dict):
        """Применить награды игроку"""
        if "coins" in rewards:
            player.coins += rewards["coins"]
        if "diamonds" in rewards:
            player.diamonds += rewards["diamonds"]
        if "seeds" in rewards:
            inventory = player.inventory
            if not inventory:
                inventory = Inventory(player_id=player.id, seeds={})
                self.db.add(inventory)

            # Добавляем случайные семена из доступных растений
            unlocked_plants = LevelConfig.get_unlocked_plants(player.level.current_level)
            for _ in range(rewards["seeds"]):
                if unlocked_plants:
                    plant = random.choice(unlocked_plants)
                    inventory.seeds[plant] = inventory.seeds.get(plant, 0) + 1

    def get_level_info(self, player_id: int) -> Dict:
        """Получить информацию об уровне игрока"""
        player_level = self.db.query(PlayerLevel).filter(
            PlayerLevel.player_id == player_id
        ).first()

        if not player_level:
            player_level = PlayerLevel(
                player_id=player_id,
                current_level=1,
                current_xp=0,
                total_xp=0
            )
            self.db.add(player_level)
            self.db.commit()

        next_config = LevelConfig.get_config(player_level.current_level + 1)

        return {
            "current_level": player_level.current_level,
            "current_xp": player_level.current_xp,
            "total_xp": player_level.total_xp,
            "next_level_xp": player_level.get_next_level_xp(),
            "progress_percentage": player_level.get_progress_percentage(),
            "unlocked_features": player_level.get_unlocked_features(),
            "next_level_rewards": next_config["rewards"] if next_config else {},
            "unlocked_plants": LevelConfig.get_unlocked_plants(player_level.current_level)
        }

    def plant_seed_with_xp(self, player_id: int, plant_type: str, position: Dict) -> Dict:
        """Посадить семя с начислением XP"""
        # Существующая логика посадки...
        result = self.plant_seed(player_id, plant_type, position)

        if result["success"]:
            # Начисляем XP за посадку
            xp_values = {
                "carrot": 5,
                "tomato": 7,
                "cucumber": 8,
                "strawberry": 10,
                "pumpkin": 15
            }
            xp_amount = xp_values.get(plant_type, 5)
            xp_result = self.add_xp(player_id, xp_amount, "planting")

            result["xp_gained"] = xp_amount
            result["level_up"] = xp_result.get("level_up", False)

            if xp_result["level_up"]:
                result["level_data"] = xp_result

        return result

    def harvest_with_xp(self, player_id: int, plant_id: str) -> Dict:
        """Собрать урожай с начислением XP"""
        # Существующая логика сбора...
        result = self.harvest_plant(player_id, plant_id)

        if result["success"]:
            # Начисляем XP за сбор
            xp_values = {
                "carrot": 10,
                "tomato": 15,
                "cucumber": 18,
                "strawberry": 25,
                "pumpkin": 40
            }
            xp_amount = xp_values.get(result["plant_type"], 10)
            xp_result = self.add_xp(player_id, xp_amount, "harvesting")

            result["xp_gained"] = xp_amount
            result["level_up"] = xp_result.get("level_up", False)

            if xp_result["level_up"]:
                result["level_data"] = xp_result

        return result