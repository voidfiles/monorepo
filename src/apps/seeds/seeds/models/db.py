import os

DATABASE_URL = os.environ.get("DATABASE_URL")
TEST_DATABASE_URL = os.environ.get("TEST_DATABASE_URL")
TEST_MODE = os.environ.get("TEST_MODE")


# if TEST_MODE == "1":
#     database = connect(TEST_DATABASE_URL)
# else:
#     database = connect(DATABASE_URL)

# database_proxy.initialize(database)
