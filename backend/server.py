from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============== MODELS ==============

class LeaderboardEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    display_name: str
    longest_streak: int = 0
    total_deliveries: int = 0
    weekly_earnings: float = 0.0
    monthly_rank: str = "Bronze Courier"
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class LeaderboardCreate(BaseModel):
    display_name: str
    longest_streak: int = 0
    total_deliveries: int = 0
    weekly_earnings: float = 0.0

class LeaderboardUpdate(BaseModel):
    display_name: Optional[str] = None
    longest_streak: Optional[int] = None
    total_deliveries: Optional[int] = None
    weekly_earnings: Optional[float] = None

class AIMessage(BaseModel):
    message: str
    context: Optional[dict] = None

class AIResponse(BaseModel):
    response: str

# ============== HELPER FUNCTIONS ==============

def calculate_monthly_rank(deliveries: int, streak: int) -> str:
    """Calculate monthly rank based on deliveries and streak"""
    score = deliveries + (streak * 10)
    if score >= 1000:
        return "Iron Courier"
    elif score >= 500:
        return "Gold Courier"
    elif score >= 200:
        return "Silver Courier"
    return "Bronze Courier"

# ============== ROUTES ==============

@api_router.get("/")
async def root():
    return {"message": "Iron Courier API", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

# Leaderboard endpoints
@api_router.get("/leaderboard", response_model=List[LeaderboardEntry])
async def get_leaderboard(sort_by: str = "longest_streak", limit: int = 50):
    """Get leaderboard sorted by specified field"""
    sort_field = sort_by if sort_by in ["longest_streak", "total_deliveries", "weekly_earnings"] else "longest_streak"
    projection = {"_id": 0, "id": 1, "display_name": 1, "longest_streak": 1, "total_deliveries": 1, "weekly_earnings": 1, "monthly_rank": 1, "updated_at": 1}
    entries = await db.leaderboard.find({}, projection).sort(sort_field, -1).limit(limit).to_list(limit)
    return [LeaderboardEntry(**entry) for entry in entries]

@api_router.post("/leaderboard", response_model=LeaderboardEntry)
async def create_leaderboard_entry(entry: LeaderboardCreate):
    """Create a new leaderboard entry"""
    monthly_rank = calculate_monthly_rank(entry.total_deliveries, entry.longest_streak)
    entry_obj = LeaderboardEntry(
        display_name=entry.display_name,
        longest_streak=entry.longest_streak,
        total_deliveries=entry.total_deliveries,
        weekly_earnings=entry.weekly_earnings,
        monthly_rank=monthly_rank
    )
    await db.leaderboard.insert_one(entry_obj.dict())
    return entry_obj

@api_router.put("/leaderboard/{entry_id}", response_model=LeaderboardEntry)
async def update_leaderboard_entry(entry_id: str, update: LeaderboardUpdate):
    """Update an existing leaderboard entry"""
    projection = {"_id": 0, "id": 1, "display_name": 1, "longest_streak": 1, "total_deliveries": 1, "weekly_earnings": 1, "monthly_rank": 1, "updated_at": 1}
    existing = await db.leaderboard.find_one({"id": entry_id}, projection)
    if not existing:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    update_data = {k: v for k, v in update.dict().items() if v is not None}
    if update_data:
        # Recalculate monthly rank
        deliveries = update_data.get("total_deliveries", existing.get("total_deliveries", 0))
        streak = update_data.get("longest_streak", existing.get("longest_streak", 0))
        update_data["monthly_rank"] = calculate_monthly_rank(deliveries, streak)
        update_data["updated_at"] = datetime.utcnow()
        
        await db.leaderboard.update_one({"id": entry_id}, {"$set": update_data})
    
    updated = await db.leaderboard.find_one({"id": entry_id}, projection)
    return LeaderboardEntry(**updated)

@api_router.delete("/leaderboard/{entry_id}")
async def delete_leaderboard_entry(entry_id: str):
    """Delete a leaderboard entry"""
    result = await db.leaderboard.delete_one({"id": entry_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Entry not found")
    return {"message": "Entry deleted"}

# AI Assistant endpoint
@api_router.post("/ai/chat", response_model=AIResponse)
async def ai_chat(message: AIMessage):
    """Chat with AI productivity assistant"""
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="AI service not configured")
        
        # Build context-aware system message
        context = message.context or {}
        current_streak = context.get('currentStreak', 0)
        longest_streak = context.get('longestStreak', 0)
        total_deliveries = context.get('totalDeliveries', 0)
        total_earnings = context.get('totalEarnings', 0)
        monthly_rank = context.get('monthlyRank', 'Bronze Courier')
        language = context.get('language', 'en')
        
        language_instruction = ""
        if language == 'uk':
            language_instruction = "IMPORTANT: Respond in Ukrainian language only."
        elif language == 'ru':
            language_instruction = "IMPORTANT: Respond in Russian language only."
        else:
            language_instruction = "Respond in English."
        
        system_message = f"""You are Iron Coach, an AI productivity assistant for delivery drivers and gig workers using the Iron Courier app. Your role is to:

1. MOTIVATE users to maintain work discipline and extend their work streaks
2. ANALYZE productivity patterns and provide actionable insights
3. SUGGEST best working hours based on their data
4. ENCOURAGE discipline and celebrate achievements
5. Help users reach their goals and beat their records

User's Current Stats:
- Current Work Streak: {current_streak} days
- Longest Streak Record: {longest_streak} days
- Total Deliveries: {total_deliveries}
- Total Earnings: {total_earnings}
- Monthly Rank: {monthly_rank}

Be enthusiastic, supportive, and direct. Use motivational language. Keep responses concise (2-4 sentences max) unless asked for detailed analysis. Reference their actual stats when relevant.

{language_instruction}"""
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"iron-coach-{uuid.uuid4()}",
            system_message=system_message
        ).with_model("openai", "gpt-5.2")
        
        user_message = UserMessage(text=message.message)
        response = await chat.send_message(user_message)
        
        return AIResponse(response=response)
        
    except Exception as e:
        logger.error(f"AI chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
