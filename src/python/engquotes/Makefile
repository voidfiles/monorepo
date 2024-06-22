

setup:
	pipenv install
	op run --env-file=".setup.env" -- pipenv run s3-credentials create engquotes-bucket --create-bucket

run:
	op run --env-file=".dev.env" -- \
	pipenv run python engquotes/app.py
