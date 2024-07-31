import os


def test_mode():
    assert os.environ["TEST_MODE"] == "1"
