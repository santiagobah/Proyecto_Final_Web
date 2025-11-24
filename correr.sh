lsof -ti:3000 2>/dev/null | xargs kill -9 2>/dev/null || true
lsof -ti:8080 2>/dev/null | xargs kill -9 2>/dev/null || true
lsof -ti:5432 2>/dev/null | xargs kill -9 2>/dev/null || true

docker compose down

docker compose up -d --build

echo "http://localhost:3000"

docker compose logs -f