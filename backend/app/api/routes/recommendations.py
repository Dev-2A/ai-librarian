from fastapi import APIRouter, HTTPException, status
from app.schemas.book import RecommendationResponse
from app.schemas.recommendation import RecommendByReviewRequest, RecommendByBookRequest
from app.services.elasticsearch import get_es_service

router = APIRouter(prefix="/recommendations", tags=["도서 추천"])


@router.post(
    "/by-review",
    response_model=list[RecommendationResponse],
    summary="감상평 기반 추천",
    description="자유 감상평이나 원하는 독서 취향을 입력하면 유사한 도서를 추천합니다.",
)
async def recommend_by_review(request: RecommendByReviewRequest):
    es = get_es_service()
    
    if not await es.ping():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Elasticsearch가 연결되어 있지 않습니다.",
        )
    
    results = await es.search_similar_by_review(
        review=request.review,
        top_k=request.top_k,
    )
    
    if not results:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="추천할 도서가 없습니다. 먼저 도서를 등록해 주세요.",
        )
    
    return results


@router.post(
    "/by-book",
    response_model=list[RecommendationResponse],
    summary="도서 기반 추천",
    description="이미 등록된 도서와 유사한 도서를 추천합니다.",
)
async def recommend_by_book(request: RecommendByBookRequest):
    es = get_es_service()
    
    if not await es.ping():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Elasticsearch가 연결되어 있지 않습니다.",
        )
    
    results = await es.search_similar_by_book_id(
        book_id=request.book_id,
        top_k=request.top_k,
    )
    
    if results is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"도서를 찾을 수 없습니다: {request.book_id}",
        )
    
    if not results:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="추천할 유사 도서가 없습니다. 도서를 더 등록해 주세요.",
        )
    
    return results