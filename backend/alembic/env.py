import sys
import os
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# ===== КРИТИЧЕСКИ ВАЖНО: Добавляем пути к модулям =====
# Эта часть исправляет ошибку "No module named 'app.database'"
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # добавляем /app/alembic
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))  # добавляем /app

# ===== ИМПОРТ МОДЕЛЕЙ =====
# Теперь импорт должен работать
try:
    from app.database import Base
    # ВНИМАНИЕ: Здесь нужно импортировать ВСЕ модели вашего приложения,
    # чтобы Alembic их "увидел". Пример:
    # from app.models.user import User
    # from app.models.plant import Plant
    # from app.models.farm import Farm
except ImportError as e:
    print(f"ОШИБКА ИМПОРТА: {e}")
    print(f"Текущий sys.path: {sys.path}")
    raise

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ===== НАСТРОЙКА METADATA =====
# Указываем target_metadata для автогенерации миграций
target_metadata = Base.metadata


# ===== НАСТРОЙКА ПОДКЛЮЧЕНИЯ К БД =====
def get_url():
    """Получаем URL базы данных из переменных окружения или alembic.ini"""

    # ПРИОРИТЕТ 1: Переменная окружения DATABASE_URL (используется на Render)
    database_url = os.getenv("DATABASE_URL")

    if database_url:
        # Важно для PostgreSQL на Render: заменяем postgres:// на postgresql://
        if database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql://", 1)
        print(f"Используется DATABASE_URL из переменных окружения")
        return database_url

    # ПРИОРИТЕТ 2: Чтение из alembic.ini
    return config.get_main_option("sqlalchemy.url")


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,  # Включаем сравнение типов колонок
        compare_server_default=True,  # Сравниваем значения по умолчанию
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    # Получаем конфигурацию из alembic.ini
    configuration = config.get_section(config.config_ini_section)
    if configuration is None:
        configuration = {}

    # Устанавливаем URL подключения
    configuration['sqlalchemy.url'] = get_url()

    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,  # Включаем сравнение типов колонок
            compare_server_default=True,  # Сравниваем значения по умолчанию
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()