"""add level system tables

Revision ID: xxx
Revises: previous_revision
Create Date: 2024-01-01 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa


def upgrade():
    # Таблица уровней игроков
    op.create_table('player_levels',
                    sa.Column('id', sa.Integer(), nullable=False),
                    sa.Column('player_id', sa.Integer(), nullable=False),
                    sa.Column('current_level', sa.Integer(), nullable=False, default=1),
                    sa.Column('current_xp', sa.Integer(), nullable=False, default=0),
                    sa.Column('total_xp', sa.Integer(), nullable=False, default=0),
                    sa.Column('created_at', sa.Float(), nullable=False),
                    sa.Column('updated_at', sa.Float(), nullable=False),
                    sa.ForeignKeyConstraint(['player_id'], ['players.id']),
                    sa.PrimaryKeyConstraint('id'),
                    sa.UniqueConstraint('player_id')
                    )
    op.create_index('ix_player_levels_player_id', 'player_levels', ['player_id'])

    # Таблица достижений
    op.create_table('achievements',
                    sa.Column('id', sa.Integer(), nullable=False),
                    sa.Column('player_level_id', sa.Integer(), nullable=False),
                    sa.Column('name', sa.String(), nullable=False),
                    sa.Column('description', sa.String(), nullable=False),
                    sa.Column('unlocked_at', sa.Float(), nullable=True),
                    sa.Column('reward', sa.JSON(), nullable=True),
                    sa.ForeignKeyConstraint(['player_level_id'], ['player_levels.id']),
                    sa.PrimaryKeyConstraint('id')
                    )
    op.create_index('ix_achievements_player_level_id', 'achievements', ['player_level_id'])


def downgrade():
    op.drop_table('achievements')
    op.drop_table('player_levels')