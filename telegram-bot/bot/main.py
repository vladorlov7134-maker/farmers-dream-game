# telegram-bot/bot/main.py (дополнение)
import logging
from telegram.ext import Application
from handlers import game_handlers, level_handlers  # Добавить level_handlers

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)


def main():
    """Запуск бота"""
    application = Application.builder().token(BOT_TOKEN).build()

    # Регистрация обработчиков
    game_handlers.setup_handlers(application)
    level_handlers.setup_handlers(application)  # Добавить эту строку

    # Запуск бота
    application.run_polling()


if __name__ == '__main__':
    main()