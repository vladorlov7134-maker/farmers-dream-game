from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

app = FastAPI()


# Ваши API endpoints ДОЛЖНЫ быть объявлены ПЕРЕД статическими файлами
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "farmers-dream"}


@app.get("/api/game/state")
async def get_game_state():
    # ваша логика
    return {"level": 1, "coins": 100}


# ... другие API endpoints ...

# ТОЛЬКО ПОСЛЕ ВСЕХ API маршрутов добавляем статику
# Проверяем, существует ли папка со сборкой фронтенда
frontend_dist_path = os.path.join(os.path.dirname(__file__), "../../frontend/dist")
if os.path.exists(frontend_dist_path):
    app.mount("/", StaticFiles(directory=frontend_dist_path, html=True), name="frontend")


    # Fallback для SPA - все остальные пути отдают index.html
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        return FileResponse(os.path.join(frontend_dist_path, "index.html"))
else:
    @app.get("/")
    async def root():
        return {"message": "Backend is running. Frontend not built."}