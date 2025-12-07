"""initial

Revision ID: initial
Revises:
Create Date: 2024-01-01 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = 'initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Таблица игроков
    op.create_table('players',
                    sa.Column('id', sa.Integer(), nullable=False),
                    sa.Column('telegram_id', sa.Integer(), nullable=True),
                    sa.Column('username', sa.String(), nullable=True),
                    sa.Column('coins', sa.Integer(), nullable=False, default=1000),
                    sa.Column('diamonds', sa.Integer(), nullable=False, default=5),
                    sa.Column('created_at', sa.Float(), nullable=False),
                    sa.Column('last_active', sa.Float(), nullable=False),
                    sa.PrimaryKeyConstraint('id')
                    )
    op.create_index(op.f('ix_players_id'), 'players', ['id'], unique=False)
    op.create_index(op.f('ix_players_telegram_id'), 'players', ['telegram_id'], unique=True)

    # Таблица уровней игроков
    op.create_table('player_levels',
                    sa.Column('id', sa.Integer(), nullable=False),
                    sa.Column('player_id', sa.Integer(), nullable=False),
                    sa.Column('current_level', sa.Integer(), nullable=False, default=1),
                    sa.Column('current_xp', sa.Integer(), nullable=False, default=0),
                    sa.Column('total_xp', sa.Integer(), nullable=False, default=0),
                    sa.Column('created_at', sa.Float(), nullable=False),
                    sa.Column('updated_at', sa.Float(), nullable=False),
                    sa.ForeignKeyConstraint(['player_id'], ['players.id'], ),
                    sa.PrimaryKeyConstraint('id'),
                    sa.UniqueConstraint('player_id')
                    )
    op.create_index(op.f('ix_player_levels_id'), 'player_levels', ['id'], unique=False)
    op.create_index(op.f('ix_player_levels_player_id'), 'player_levels', ['player_id'], unique=True)

    # Таблица инвентарей
    op.create_table('inventories',
                    sa.Column('id', sa.Integer(), nullable=False),
                    sa.Column('player_id', sa.Integer(), nullable=False),
                    sa.Column('seeds', sa.JSON(), nullable=True),
                    sa.Column('harvest', sa.JSON(), nullable=True),
                    sa.ForeignKeyConstraint(['player_id'], ['players.id'], ),
                    sa.PrimaryKeyConstraint('id'),
                    sa.UniqueConstraint('player_id')
                    )
    op.create_index(op.f('ix_inventories_id'), 'inventories', ['id'], unique=False)
    op.create_index(op.f('ix_inventories_player_id'), 'inventories', ['player_id'], unique=True)

    # Таблица достижений
    op.create_table('achievements',
                    sa.Column('id', sa.Integer(), nullable=False),
                    sa.Column('player_level_id', sa.Integer(), nullable=False),
                    sa.Column('name', sa.String(), nullable=False),
                    sa.Column('description', sa.String(), nullable=False),
                    sa.Column('unlocked_at', sa.Float(), nullable=True),
                    sa.Column('reward', sa.JSON(), nullable=True),
                    sa.ForeignKeyConstraint(['player_level_id'], ['player_levels.id'], ),
                    sa.PrimaryKeyConstraint('id')
                    )
    op.create_index(op.f('ix_achievements_id'), 'achievements', ['id'], unique=False)
    op.create_index(op.f('ix_achievements_player_level_id'), 'achievements', ['player_level_id'], unique=False)

    # Таблица фермы
    op.create_table('farm_cells',
                    sa.Column('id', sa.Integer(), nullable=False),
                    sa.Column('player_id', sa.Integer(), nullable=False),
                    sa.Column('x', sa.Integer(), nullable=False),
                    sa.Column('y', sa.Integer(), nullable=False),
                    sa.Column('plant_type', sa.String(), nullable=True),
                    sa.Column('planted_at', sa.Float(), nullable=True),
                    sa.Column('stage', sa.String(), nullable=True),
                    sa.Column('is_watered', sa.Boolean(), nullable=True),
                    sa.Column('has_fertilizer', sa.Boolean(), nullable=True),
                    sa.ForeignKeyConstraint(['player_id'], ['players.id'], ),
                    sa.PrimaryKeyConstraint('id'),
                    sa.UniqueConstraint('player_id', 'x', 'y', name='uq_player_cell')
                    )
    op.create_index(op.f('ix_farm_cells_id'), 'farm_cells', ['id'], unique=False)
    op.create_index(op.f('ix_farm_cells_player_id'), 'farm_cells', ['player_id'], unique=False)


def downgrade():
    op.drop_table('farm_cells')
    op.drop_table('achievements')
    op.drop_table('inventories')
    op.drop_table('player_levels')
    op.drop_table('players')