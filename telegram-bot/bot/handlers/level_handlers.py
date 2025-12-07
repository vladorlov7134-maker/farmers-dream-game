# telegram-bot/bot/handlers/level_handlers.py
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes, CommandHandler, CallbackQueryHandler
import logging
import requests
from typing import Dict

logger = logging.getLogger(__name__)


async def level_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Команда /level - показать уровень игрока"""
    user = update.effective_user

    try:
        # Запрос к API для получения информации об уровне
        response = requests.get(f"{API_BASE}/levels/info/{user.id}")

        if response.status_code == 200:
            data = response.json()

            message = (
                f"🏆 <b>Уровень {data['current_level']}</b>\n\n"
                f"✨ XP: {data['current_xp']} / {data['current_xp'] + data['next_level_xp']}\n"
                f"📊 Прогресс: {data['progress_percentage']}%\n"
                f"⭐ Всего XP: {data['total_xp']}\n\n"
            )

            # Показываем награды следующего уровня
            if data['next_level_rewards']:
                message += "<b>Награды за следующий уровень:</b>\n"
                for reward_type, value in data['next_level_rewards'].items():
                    icons = {"coins": "🪙", "diamonds": "💎", "seeds": "🌱"}
                    message += f"{icons.get(reward_type, '🎁')} {value}\n"

            # Кнопки
            keyboard = [
                [
                    InlineKeyboardButton("📈 Лидеры", callback_data="leaderboard"),
                    InlineKeyboardButton("🎮 В игру", callback_data="play_game")
                ]
            ]
            reply_markup = InlineKeyboardMarkup(keyboard)

            await update.message.reply_html(message, reply_markup=reply_markup)
        else:
            await update.message.reply_text("❌ Не удалось загрузить информацию об уровне.")

    except Exception as e:
        logger.error(f"Error in level command: {e}")
        await update.message.reply_text("⚠️ Произошла ошибка. Попробуйте позже.")


async def leaderboard_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Показать таблицу лидеров"""
    query = update.callback_query
    await query.answer()

    try:
        response = requests.get(f"{API_BASE}/levels/leaderboard?limit=10")

        if response.status_code == 200:
            data = response.json()
            leaderboard = data.get('leaderboard', [])

            message = "🏆 <b>Топ фермеров</b>\n\n"

            for player in leaderboard:
                medal = "🥇" if player['rank'] == 1 else "🥈" if player['rank'] == 2 else "🥉" if player[
                                                                                                   'rank'] == 3 else "🏅"
                message += (
                    f"{medal} {player['username']}\n"
                    f"   Уровень: {player['level']} | XP: {player['total_xp']}\n\n"
                )

            keyboard = [[InlineKeyboardButton("🔙 Назад", callback_data="back_to_level")]]
            reply_markup = InlineKeyboardMarkup(keyboard)

            await query.edit_message_text(message, parse_mode='HTML', reply_markup=reply_markup)
        else:
            await query.edit_message_text("❌ Не удалось загрузить таблицу лидеров.")

    except Exception as e:
        logger.error(f"Error in leaderboard: {e}")
        await query.edit_message_text("⚠️ Произошла ошибка.")


async def back_to_level_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Вернуться к информации об уровне"""
    query = update.callback_query
    await query.answer()
    await level_command(update, context)


def setup_handlers(application):
    """Регистрация обработчиков уровней"""
    application.add_handler(CommandHandler("level", level_command))
    application.add_handler(CallbackQueryHandler(leaderboard_callback, pattern="^leaderboard$"))
    application.add_handler(CallbackQueryHandler(back_to_level_callback, pattern="^back_to_level$"))