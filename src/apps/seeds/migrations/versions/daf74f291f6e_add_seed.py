"""add seed

Revision ID: daf74f291f6e
Revises: da9a6c4065da
Create Date: 2024-07-28 15:12:50.160821

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel                                 # New


# revision identifiers, used by Alembic.
revision = 'daf74f291f6e'
down_revision = 'da9a6c4065da'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('seed',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('uri', sa.String(), nullable=False),
    sa.Column('created', sa.DateTime(timezone=True), nullable=False),
    sa.Column('updated', sa.DateTime(timezone=True), nullable=False),
    sa.Column('kind', sa.Enum(name='seed_source', create_constraint=True), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('uri')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('seed')
    # ### end Alembic commands ###