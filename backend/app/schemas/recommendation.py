from pydantic import BaseModel, Field


# ── 감상평 기반 추천 요청 ──
class RecommendByReviewRequest(BaseModel):
    review: str = Field(
        ...,
        min_length=10,
        example="우주의 광활함 속에서 인간 존재의 의미를 생각하게 만드는 SF 소설이 읽고 싶다.",
    )
    top_k: int = Field(default=5, ge=1, le=20, description="추천받을 도서 수")


# ── 등록된 도서 기반 추천 요청 ──
class RecommendByBookRequest(BaseModel):
    book_id: str = Field(..., description="이미 등록된 도서의 ID")
    top_k: int = Field(default=5, ge=1, le=20, description="추천받을 도서 수")