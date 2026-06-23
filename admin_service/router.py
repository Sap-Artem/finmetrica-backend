from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from typing import List

from dal.database import get_session
from dal.models.users import User, UserPublic
from auth_service.security import get_current_user

router = APIRouter()

@router.get("/users", response_model=List[UserPublic])
async def get_all_users(current_user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Требуются права администратора")
    users = (await session.exec(select(User))).all()
    return users
