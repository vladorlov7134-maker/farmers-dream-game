import os
import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# ====================== НАСТРОЙКИ ======================

# ВАША ССЫЛКА НА ИГРУ (Vercel)
GAME_URL = "https://farmers-dream-game-jrnmfganc-vladislavs-projects-509bdccb.vercel.app"

# Токен бота (замените на ваш!)
BOT_TOKEN = "8531589914:AAEy033OSRtw98l12ttcxkWppT2soA-kCdQ"  # ⚠️ ЗАМЕНИТЕ ЭТО!


# ====================== КОМАНДЫ БОТА ======================

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Команда /start - главное меню с кнопкой игры"""
    user = update.effective_user

    # Создаем кнопку для открытия игры
    keyboard = [
        [InlineKeyboardButton(
            text="🚜 ОТКРЫТЬ ФЕРМУ",
            web_app=WebAppInfo(url=GAME_URL)
        )],
        [
            InlineKeyboardButton("📊 Статистика", callback_data="stats"),
            InlineKeyboardButton("🏪 Магазин", callback_data="shop")
        ],
        [InlineKeyboardButton("❓ Помощь", callback_data="help")]
    ]

    reply_markup = InlineKeyboardMarkup(keyboard)

    # Текст приветствия
    welcome_text = f"""
👋 *Добро пожаловать, {user.first_name}!*

🌱 *Farmers Dream* — увлекательная фермерская игра прямо в Telegram!

🎮 *Как начать играть:*
1. Нажмите кнопку *«🚜 ОТКРЫТЬ ФЕРМУ»* ниже
2. Игра откроется прямо здесь, в Telegram
3. Сажайте растения, собирайте урожай, развивайте ферму!

💰 *Зарабатывайте монеты* и становитесь лучшим фермером!

*Удачи в игре!* 🚀
    """

    await update.message.reply_text(
        welcome_text,
        reply_markup=reply_markup,
        parse_mode="Markdown"
    )
    logger.info(f"Пользователь {user.id} ({user.username}) начал игру")


async def play(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Команда /play - быстрый запуск игры"""
    # Простая кнопка для быстрого запуска
    keyboard = [[InlineKeyboardButton(
        "🎮 НАЧАТЬ ИГРАТЬ",
        web_app=WebAppInfo(url=GAME_URL)
    )]]

    reply_markup = InlineKeyboardMarkup(keyboard)

    await update.message.reply_text(
        "Нажмите кнопку ниже, чтобы открыть ферму! 🌱\n"
        "Игра запустится прямо в Telegram.",
        reply_markup=reply_markup
    )


async def game(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Команда /game - альтернативная команда для игры"""
    keyboard = [
        [InlineKeyboardButton("🚜 Ферма", web_app=WebAppInfo(url=GAME_URL))],
        [InlineKeyboardButton("🏪 Магазин семян", callback_data="shop_seeds")],
        [InlineKeyboardButton("📈 Прогресс", callback_data="progress")]
    ]

    reply_markup = InlineKeyboardMarkup(keyboard)

    await update.message.reply_text(
        "🎮 *Игровое меню*\n\n"
        "Выберите раздел:",
        reply_markup=reply_markup,
        parse_mode="Markdown"
    )


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Команда /help - помощь по игре"""
    help_text = """
🎮 *Farmers Dream - Помощь*

*Основные команды:*
/start - Главное меню
/play - Быстрый запуск игры
/game - Игровое меню
/help - Эта справка

*Как играть:*
1. Нажмите кнопку «🚜 ОТКРЫТЬ ФЕРМУ»
2. Выберите свободную клетку на поле
3. Купите семена в магазине
4. Посадите семена на выбранную клетку
5. Ждите, когда растение вырастет
6. Соберите урожай и продайте его
7. Зарабатывайте монеты, улучшайте ферму!

*Советы:*
• Начинайте с моркови - она растет быстрее
• Регулярно собирайте урожай
• Улучшайте ферму для большего дохода
• Приглашайте друзей для получения бонусов

*Удачи в фермерстве!* 🌟
    """

    keyboard = [[InlineKeyboardButton("🚜 Перейти к игре", web_app=WebAppInfo(url=GAME_URL))]]
    reply_markup = InlineKeyboardMarkup(keyboard)

    await update.message.reply_text(
        help_text,
        reply_markup=reply_markup,
        parse_mode="Markdown"
    )


async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработчик нажатий на кнопки"""
    query = update.callback_query
    await query.answer()

    data = query.data

    if data == "stats":
        await query.edit_message_text(
            "📊 *Ваша статистика*\n\n"
            "👨‍🌾 Уровень: 1\n"
            "⭐ Опыт: 0/100\n"
            "💰 Баланс: 100 монет\n"
            "🌱 Посажено растений: 0\n"
            "🏆 Место в рейтинге: -\n\n"
            "*Продолжайте в том же духе!*",
            parse_mode="Markdown"
        )
    elif data == "shop":
        keyboard = [
            [InlineKeyboardButton("🥕 Морковь (10 монет)", callback_data="buy_carrot")],
            [InlineKeyboardButton("🌾 Пшеница (20 монет)", callback_data="buy_wheat")],
            [InlineKeyboardButton("🥔 Картофель (15 монет)", callback_data="buy_potato")],
            [InlineKeyboardButton("🚜 Вернуться к игре", web_app=WebAppInfo(url=GAME_URL))]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)

        await query.edit_message_text(
            "🏪 *Магазин семян*\n\n"
            "Выберите семена для покупки:\n\n"
            "• 🥕 Морковь - 10 монет\n"
            "   Быстро растет, стабильный доход\n\n"
            "• 🌾 Пшеница - 20 монет\n"
            "   Дороже, но дает больше дохода\n\n"
            "• 🥔 Картофель - 15 монет\n"
            "   Баланс цены и дохода\n\n"
            "*Ваш баланс: 100 монет*",
            reply_markup=reply_markup,
            parse_mode="Markdown"
        )
    elif data == "help":
        await help_command(update, context)


async def error_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработчик ошибок"""
    logger.error(f"Ошибка: {context.error}")

    if update and update.effective_message:
        await update.effective_message.reply_text(
            "😕 Произошла ошибка. Попробуйте еще раз или напишите /start",
            parse_mode="Markdown"
        )


# ====================== ЗАПУСК БОТА ======================

def main() -> None:
    """Запуск Telegram бота"""
    print("=" * 60)
    print("🤖 ЗАПУСК FARMERS DREAM TELEGRAM BOT")
    print("=" * 60)
    print(f"🎮 Ссылка на игру: {GAME_URL}")
    print(
        f"🔑 Токен бота: {'*' * 10}{BOT_TOKEN[-10:] if BOT_TOKEN and BOT_TOKEN != 'ВАШ_ТОКЕН_БОТА' else 'НЕ УСТАНОВЛЕН'}")
    print("=" * 60)

    # Проверка токена
    if not BOT_TOKEN or BOT_TOKEN == "ВАШ_ТОКЕН_БОТА":
        print("\n❌ КРИТИЧЕСКАЯ ОШИБКА!")
        print("Токен бота не установлен!")
        print("\nКак получить токен:")
        print("1. Откройте Telegram, найдите @BotFather")
        print("2. Напишите /newbot и следуйте инструкциям")
        print("3. Скопируйте токен (выглядит как: 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz)")
        print("4. Замените 'ВАШ_ТОКЕН_БОТА' в коде на ваш токен")
        print("=" * 60)
        return

    try:
        # Создаем приложение
        application = Application.builder().token(BOT_TOKEN).build()

        # Регистрируем обработчики команд
        application.add_handler(CommandHandler("start", start))
        application.add_handler(CommandHandler("play", play))
        application.add_handler(CommandHandler("game", game))
        application.add_handler(CommandHandler("help", help_command))

        # Регистрируем обработчик кнопок
        application.add_handler(CallbackQueryHandler(button_callback))

        # Регистрируем обработчик ошибок
        application.add_error_handler(error_handler)

        print("\n✅ Бот успешно запущен!")
        print("\n📱 Инструкция по использованию:")
        print("1. Найдите своего бота в Telegram")
        print("2. Напишите команду /start")
        print("3. Нажмите кнопку '🚜 ОТКРЫТЬ ФЕРМУ'")
        print("4. Игра должна открыться прямо в Telegram!")
        print("\n🔧 Для выхода нажмите Ctrl+C")
        print("=" * 60)

        # Запускаем бота
        application.run_polling(allowed_updates=Update.ALL_TYPES)

    except Exception as e:
        print(f"\n❌ Ошибка при запуске бота: {e}")
        print("\nВозможные причины:")
        print("1. Неправильный токен бота")
        print("2. Проблемы с интернет-соединением")
        print("3. Бот уже запущен в другом месте")
        print("=" * 60)


# ====================== ТОЧКА ВХОДА ======================

if __name__ == "__main__":
    main()