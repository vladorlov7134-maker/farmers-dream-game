.PHONY: help install up down logs clean db-migrate bot frontend

help:
	@echo "🌱 Farmers Dream - Команды управления:"
	@echo "  make install    Установить зависимости"
	@echo "  make up         Запустить все сервисы"
	@echo "  make down       Остановить все сервисы"
	@echo "  make logs       Показать логи"
	@echo "  make clean      Очистить временные файлы"
	@echo "  make db-migrate Запустить миграции БД"
	@echo "  make bot        Запустить бота локально"
	@echo "  make frontend   Запустить фронтенд локально"

install:
	@echo "📦 Устанавливаем зависимости..."
	cd backend && pip install -r requirements.txt
	cd telegram-bot && pip install -r requirements.txt
	cd frontend && npm install

up:
	@echo "🚀 Запускаем все сервисы..."
	docker-compose up -d

down:
	@echo "🛑 Останавливаем все сервисы..."
	docker-compose down

logs:
	@echo "📋 Показываем логи..."
	docker-compose logs -f

clean:
	@echo "🧹 Очищаем временные файлы..."
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	rm -rf frontend/node_modules frontend/dist
	rm -rf backend/__pycache__ telegram-bot/__pycache__

db-migrate:
	@echo "🗄️ Запускаем миграции БД..."
	docker-compose exec backend alembic upgrade head

bot:
	@echo "🤖 Запускаем Telegram бота..."
	cd telegram-bot && python -m bot.main

frontend:
	@echo "🎮 Запускаем фронтенд..."
	cd frontend && npm run dev

init-db:
	@echo "🗄️ Инициализируем базу данных..."
	docker-compose exec postgres psql -U farmer -d farmers_dream -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"