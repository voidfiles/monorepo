
tailwindcss:
	curl -sLO https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-macos-arm64
	chmod +x tailwindcss-macos-arm64
	mv tailwindcss-macos-arm64 tailwindcss

setup: tailwindcss
	pipenv install

test:
	pipenv run pytest

runserver:
	pipenv run python manage.py runserver

watchstatic:
	./tailwindcss -i static/input.css -o static/output.css --watch

honcho:
	pipenv run honcho start