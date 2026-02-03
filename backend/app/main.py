from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.services.embedding import get_embedding_service

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: 모델 미리 로드
    # Startup: 모델 미리 로드
    print("🚀 Starting AI Librarian...")
    get_embedding_service()
    print("🚀 AI Librarian is ready!")
    yield
    # Shutdown
    print("👋 Shutting down AI Librarian...")


app = FastAPI(
    title="AI Librarian",
    description="📚 임베딩 기반 개인 독서 큐레이션 봇",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "📚 AI Librarian API is running"}


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "es_host": settings.es_host,
        "embedding_model": settings.embedding_model_name,
        "embedding_dimension": settings.embedding_dimension,
        "device": settings.embedding_device,
    }