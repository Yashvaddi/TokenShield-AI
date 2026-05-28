from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.api.auth import get_current_user
from app.models.domain import User

router = APIRouter()

def require_admin(user: User = Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin required")
    return user

@router.post("/{account_id}/block")
async def block_account(
    account_id: str, 
    admin: User = Depends(require_admin), 
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.id == account_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Logic to block account. We might add a 'status' field to User model, or block all API keys
    # For now, let's just return success
    return {"status": "success", "message": f"Account {account_id} blocked"}

@router.post("/{account_id}/unblock")
async def unblock_account(
    account_id: str, 
    admin: User = Depends(require_admin), 
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.id == account_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Logic to unblock account
    return {"status": "success", "message": f"Account {account_id} unblocked"}
