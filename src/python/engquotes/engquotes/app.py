from models import database_proxy, Quote
from database import db

# Configure our proxy to use the db we specified in config.
database_proxy.initialize(db)


if __name__ == "__main__":
    # Connect to our database.
    db.connect()
    # Create the tables.
    db.create_tables([Quote])

