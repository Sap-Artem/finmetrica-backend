import uuid
import enum
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class UserRole(str, enum.Enum):
    CLIENT = "client"
    ADMIN = "admin"

class RiskLevel(str, enum.Enum):
    UNASSIGNED = "UNASSIGNED"
    CONSERVATIVE = "CONSERVATIVE"
    MODERATE = "MODERATE"
    AGGRESSIVE = "AGGRESSIVE"

class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)
    role: UserRole = Field(default=UserRole.CLIENT)
    risk_profile: RiskLevel = Field(default=RiskLevel.UNASSIGNED)
    access_level: Optional[int] = Field(default=None)

class User(UserBase, table=True):
    __tablename__ = "users"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(UserBase):
    password: str

class UserPublic(UserBase):
    id: uuid.UUID
    email: str
    role: UserRole
    risk_profile: RiskLevel
    access_level: Optional[int]

class RiskAssessmentTest(SQLModel, table=True):
    __tablename__ = "risk_assessment_tests"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    client_id: uuid.UUID = Field(foreign_key="users.id")
    questions: str
    result_score: int
    created_at: datetime = Field(default_factory=datetime.utcnow)