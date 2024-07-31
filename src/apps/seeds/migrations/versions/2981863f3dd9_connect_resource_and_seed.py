"""connect resource and seed

Revision ID: 2981863f3dd9
Revises: daf74f291f6e
Create Date: 2024-07-28 15:18:46.834458

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel                                 # New


# revision identifiers, used by Alembic.
revision = '2981863f3dd9'
down_revision = 'daf74f291f6e'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('resource', sa.Column('seed_id', sa.Integer(), nullable=False))
    op.create_foreign_key(None, 'resource', 'seed', ['seed_id'], ['id'])
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'resource', type_='foreignkey')
    op.drop_column('resource', 'seed_id')
    # ### end Alembic commands ###