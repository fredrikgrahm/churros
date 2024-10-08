"""Add Team and TeamMembership models

Revision ID: a10946f887a2
Revises: d2e06b3d6aa8
Create Date: 2024-08-09 10:52:24.011686

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a10946f887a2'
down_revision = 'd2e06b3d6aa8'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('team', schema=None) as batch_op:
        batch_op.create_unique_constraint('uq_team_name', ['name'])


    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('team', schema=None) as batch_op:
        batch_op.drop_constraint(None, type_='unique')

    # ### end Alembic commands ###
