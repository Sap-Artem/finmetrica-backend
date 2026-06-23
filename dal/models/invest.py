import uuid
from datetime import datetime
from sqlmodel import SQLModel, Field

class InvestmentRecommendation(SQLModel, table=True):
    __tablename__ = "investment_recommendations"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    client_id: uuid.UUID = Field(foreign_key="users.id")
    surplus_amount: int
    prompt_context: str
    generated_text: str
    generated_at: datetime = Field(default_factory=datetime.utcnow)