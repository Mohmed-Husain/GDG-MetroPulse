# MetroPulse Makefile

.PHONY: run build dev check-llm cache clean simulate simulate-all

run:
	python run.py

simulate:
	python simulate.py

simulate-all:
	python simulate.py --all

build:
	cd frontend && npm run build

cache:
	python backend/precompute_cache.py

dev:
	python run.py

check-llm:
	python -c "import asyncio; from backend.llm import check_llm_health; print(asyncio.run(check_llm_health()))"

clean:
	rm -rf frontend/dist __pycache__ backend/__pycache__
