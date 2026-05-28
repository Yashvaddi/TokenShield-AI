import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from app.models.domain import Base, User, Organization
import os
import uuid

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:password@localhost/tokenshield")

async def seed():
    engine = create_async_engine(DATABASE_URL, echo=True)
    
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    AsyncSessionLocal = async_sessionmaker(bind=engine)
    
    async with AsyncSessionLocal() as session:
        # Check if org exists
        from sqlalchemy.future import select
        result = await session.execute(select(Organization).where(Organization.name == "Default Org"))
        org = result.scalars().first()
        
        if not org:
            org = Organization(id=uuid.uuid4(), name="Default Org", plan="enterprise")
            session.add(org)
            
        # Check if user exists
        result = await session.execute(select(User).where(User.email == "admin@company.com"))
        user = result.scalars().first()
        
        if not user:
            user = User(
                id=uuid.uuid4(),
                org_id=org.id,
                email="admin@company.com",
                role="admin",
                hashed_password="hashed_password_stub" 
            )
            session.add(user)
            
        await session.commit()
        print("Database seeded with default org and user.")
        
if __name__ == "__main__":
    asyncio.run(seed())
