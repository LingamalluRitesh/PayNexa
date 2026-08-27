.PHONY: all build dev test benchmark seed clean docker-up docker-down

all: build test

install:
	npm install

build:
	npm run build

dev:
	npm run dev

test:
	npm test

benchmark:
	npm run benchmark

seed:
	npm run seed

measure:
	python measure.py --no-llm --build none

docker-up:
	docker-compose up -d --build

docker-down:
	docker-compose down

clean:
	rm -rf dist node_modules packages/*/dist server/dist client/dist data
