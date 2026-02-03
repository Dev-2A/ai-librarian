from pydantic import BaseModel, Field
from datetime import datetime


# ── 도서 등록 요청 ──
class BookCreateRequest(BaseModel):
    title: str = Field(..., example="데미안")
    author: str = Field(..., example="헤르만 헤세")
    isbn: str | None = Field(None, example="9788937460449")
    review: str = Field(
        ...,
        min_length=10,
        example="자기 자신을 찾아가는 여정이 인상적이었다. 싱클레어의 내면 성장이 나의 20대와 겹쳐 보였다.",
    )
    rating: float = Field(default=0.0, ge=0.0, le=5.0, example=4.5)
    tags: list[str] = Field(default=[], example=["성장소설", "독일문학", "자아탐색"])


# ── ES에 저장되는 도서 문서 ──
class BookDocument(BaseModel):
    id: str
    title: str
    author: str
    isbn: str | None = None
    review: str
    rating: float = 0.0
    tags: list[str] = []
    embedding: list[float] = []
    created_at: datetime


# ── 도서 응답 (embedding 벡터는 제외) ──
class BookResponse(BaseModel):
    id: str
    title: str
    author: str
    isbn: str | None = None
    review: str
    rating: float
    tags: list[str]
    created_at: datetime


# ── 추천 결과 응답 ──
class RecommendationResponse(BaseModel):
    book: BookResponse
    score: float = Field(..., description="코사인 유사도 점수 (0~1)")