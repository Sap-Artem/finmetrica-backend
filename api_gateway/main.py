from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from auth_service.router import router as auth_router
from budget_service.router import router as budget_router
from investment_service.router import router as invest_router
from admin_service.router import router as admin_router
from notification_service.router import router as notify_router

app = FastAPI(title="ФинМетрика API Gateway", version="1.0.0")

app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"]
)

@app.get("/health", tags=["System"])
async def health_check():
    return {"status": "ok"}

app.include_router(auth_router, prefix="/api/v1/auth", tags=["Аутентификация"])
app.include_router(admin_router, prefix="/api/v1/admin", tags=["Администрирование"])
app.include_router(budget_router, prefix="/api/v1/budget", tags=["Бюджет и Аналитика"])
app.include_router(invest_router, prefix="/api/v1/invest", tags=["Инвестиции (ИИ)"])
app.include_router(notify_router, prefix="/api/v1/notifications", tags=["Уведомления"])
