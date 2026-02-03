from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AI Librarian",
    description="📚 임베딩 기반 개인 독서 큐레이션 봇",
    version="0.1.0",
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
    return {"status": "healthy"}