from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class PushMessage(BaseModel):
    user_id: str
    message: str

@router.post("/send")
async def send_push_notification(payload: PushMessage):
    """ Заглушка отправки push-уведомлений (например, о превышении лимита) """
    # В реальности здесь интеграция с Firebase Cloud Messaging (FCM) или APNs
    return {"status": "sent", "delivered_to": payload.user_id, "message": payload.message}