from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from sqlalchemy import func, extract
from typing import List
from datetime import datetime, timezone

from dal.database import get_session
from dal.models.users import User
from dal.models.budget import Account, AccountCreate, Transaction, TransactionCreate, BudgetLimit, Category, FinancialGoal, FinancialGoalCreate, TransactionType
from auth_service.security import get_current_user

router = APIRouter()

# --- Справочники ---
@router.get("/categories")
async def get_categories(session: AsyncSession = Depends(get_session)):
    categories = (await session.exec(select(Category))).scalars().all()
    return categories

# --- Счета и Транзакции ---
@router.post("/accounts", response_model=Account)
async def create_account(account_in: AccountCreate, current_user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    new_account = Account(**account_in.model_dump(), client_id=current_user.id)
    session.add(new_account)
    await session.commit()
    await session.refresh(new_account)
    return new_account

@router.post("/transactions", response_model=Transaction)
async def create_transaction(tx_in: TransactionCreate, current_user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    account = await session.get(Account, tx_in.account_id)
    if not account or account.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Доступ к счету запрещен")
        
    new_tx = Transaction(**tx_in.model_dump())
    
    if new_tx.type == TransactionType.INCOME:
        account.balance += new_tx.amount
    else:
        account.balance -= new_tx.amount
        
    session.add(new_tx)
    session.add(account)
    await session.commit()
    await session.refresh(new_tx)
    return new_tx

@router.post("/sync", response_model=dict)
async def sync_offline_transactions(transactions_in: List[TransactionCreate], current_user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    added_count = 0
    for tx_in in transactions_in:
        account = await session.get(Account, tx_in.account_id)
        if account and account.client_id == current_user.id:
            new_tx = Transaction(**tx_in.model_dump())
            if new_tx.type == TransactionType.INCOME:
                account.balance += new_tx.amount
            else:
                account.balance -= new_tx.amount
            session.add(new_tx)
            session.add(account)
            added_count += 1
    await session.commit()
    return {"status": "success", "synced_transactions": added_count}

# --- Финансовые цели ---
@router.post("/goals", response_model=FinancialGoal)
async def create_goal(goal_in: FinancialGoalCreate, current_user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    new_goal = FinancialGoal(**goal_in.model_dump(), client_id=current_user.id)
    session.add(new_goal)
    await session.commit()
    await session.refresh(new_goal)
    return new_goal

# --- Аналитика за текущий месяц ---
@router.get("/analytics/monthly")
async def get_monthly_analytics(current_user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    current_month, current_year = datetime.now(timezone.utc).month, datetime.now(timezone.utc).year
    
    stmt_accs = select(Account.id).where(Account.client_id == current_user.id)
    acc_ids = (await session.exec(stmt_accs)).scalars().all()
    
    if not acc_ids:
        return {"expenses_by_category": [], "total_income": 0, "total_expense": 0}
        
    stmt_exp = select(Transaction.category_id, func.sum(Transaction.amount).label("total")).where(
        Transaction.account_id.in_(acc_ids), Transaction.type == TransactionType.EXPENSE,
        extract('month', Transaction.date) == current_month, extract('year', Transaction.date) == current_year
    ).group_by(Transaction.category_id)
    
    expenses_raw = (await session.exec(stmt_exp)).all()
    expenses_by_cat = [{"category_id": str(r[0]) if r[0] else None, "total": r[1]} for r in expenses_raw]
    total_expense = sum(r[1] for r in expenses_raw)
    
    stmt_inc = select(func.sum(Transaction.amount)).where(
        Transaction.account_id.in_(acc_ids), Transaction.type == TransactionType.INCOME,
        extract('month', Transaction.date) == current_month, extract('year', Transaction.date) == current_year
    )
    total_income = (await session.exec(stmt_inc)).scalar() or 0
    
    return {"period": f"{current_month:02d}-{current_year}", "total_income": total_income, "total_expense": total_expense, "expenses_by_category": expenses_by_cat}

# --- Прогресс лимитов ---
@router.get("/limits/progress")
async def get_limits_progress(current_user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    current_month, current_year = datetime.now(timezone.utc).month, datetime.now(timezone.utc).year
    limits = (await session.exec(select(BudgetLimit).where(BudgetLimit.client_id == current_user.id))).scalars().all()
    acc_ids = (await session.exec(select(Account.id).where(Account.client_id == current_user.id))).scalars().all()
    
    result = []
    for limit in limits:
        stmt_spent = select(func.sum(Transaction.amount)).where(
            Transaction.account_id.in_(acc_ids), Transaction.category_id == limit.category_id,
            Transaction.type == TransactionType.EXPENSE, extract('month', Transaction.date) == current_month,
            extract('year', Transaction.date) == current_year
        )
        spent = (await session.exec(stmt_spent)).scalar() or 0
        result.append({
            "limit_id": str(limit.id), "category_id": str(limit.category_id),
            "amount_limit": limit.amount_limit, "amount_spent": spent, "is_exceeded": spent > limit.amount_limit
        })
    return {"month": current_month, "progress": result}
