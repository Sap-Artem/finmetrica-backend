from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from datetime import timedelta

from dal.database import get_session
from dal.models.users import User, UserCreate, UserPublic
from core.config import settings
from auth_service.security import get_password_hash, verify_password, create_access_token

router = APIRouter()

@router.post("/register", response_model=UserPublic)
async def register(user_in: UserCreate, session: AsyncSession = Depends(get_session)):
    statement = select(User).where(User.email == user_in.email)
    result = await session.exec(statement)
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email уже зарегистрирован")
        
    hashed_password = get_password_hash(user_in.password)
    new_user = User(**user_in.model_dump(exclude={"password"}), password_hash=hashed_password)
    
    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)
    return new_user

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), session: AsyncSession = Depends(get_session)):
    statement = select(User).where(User.email == form_data.username)
    result = await session.exec(statement)
    user = result.scalars().first()
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Неверный email или пароль")
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}