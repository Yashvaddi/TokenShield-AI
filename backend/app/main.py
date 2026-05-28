from fastapi import FastAPI, Depends, HTTPException, status
import uvicorn
from fastapi.security import OAuth2PasswordRequestForm
from app.api.auth import create_access_token
from app.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.domain import User
from app.api.routes import router as api_router
from app.api.accounts import router as accounts_router
from app.api.dashboard import router as dashboard_router
from app.api.settings import router as settings_router
from app.proxy.claude_proxy import router as claude_router
from app.proxy.openai_proxy import router as openai_router
from app.proxy.gemini_proxy import router as gemini_router

app = FastAPI(title="TokenShield AI API")

app.include_router(claude_router, prefix="/proxy/anthropic", tags=["proxy"])
app.include_router(openai_router, prefix="/proxy/openai/v1", tags=["proxy"])
app.include_router(gemini_router, prefix="/proxy/gemini/v1beta/models", tags=["proxy"])
app.include_router(api_router, prefix="/api", tags=["api"])
app.include_router(accounts_router, prefix="/api/accounts", tags=["accounts"])
app.include_router(dashboard_router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(settings_router, prefix="/api/settings", tags=["settings"])

@app.post("/api/auth/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    # The frontend will send email in the 'username' field of OAuth2 form
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    # In a real app we'd check password hash here
    # if not verify_password(form_data.password, user.hashed_password):
    #     raise HTTPException(...)
    
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer", "user": {"id": str(user.id), "email": user.email, "role": user.role}}

@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "1.0"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
