from fastapi import APIRouter, HTTPException, Query, status
from app.schemas.aladin import AladinBookItem, AladinSearchResponse
from app.services.aladin import get_aladin_service

router = APIRouter(prefix="/aladin", tags=["알라딘 도서 검색"])


@router.get(
    "/search",
    response_model=AladinSearchResponse,
    summary="도서 검색",
    description="알라딘 Open API를 통해 도서를 검색합니다.",
)
async def search_books(
    query: str = Query(..., min_length=1, description="검색어"),
    query_type: str = Query(
        default="Keyword",
        description="검색 유형",
        enum=["Keyword", "Title", "Author", "Publisher"],
    ),
    max_results: int = Query(default=10, ge=1, le=50, description="최대 결과 수"),
    start: int = Query(default=1, ge=1, description="시작 페이지"),
):
    aladin = get_aladin_service()
    
    if not aladin._is_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="알라딘 API 키가 설정되지 않았습니다. .env에 ALADIN_API_KEY를 설정해 주세요.",
        )
    
    try:
        result = await aladin.search_books(query, query_type, max_results, start)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"알라딘 API 호출 실패: {str(e)}",
        )


@router.get(
    "/lookup/{isbn}",
    response_model=AladinBookItem,
    summary="ISBN으로 도서 조회",
    description="ISBN으로 도서 상세 정보를 조회합니다. 표지 이미지, 가격, 출판사 등의 정보를 가져옵니다.",
)
async def lookup_book(isbn: str):
    aladin = get_aladin_service()
    
    if not aladin._is_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="알라딘 API 키가 설정되지 않았습니다.",
        )
    
    try:
        book = await aladin.lookup_by_isbn(isbn)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"알라딘 API 호출 실패: {str(e)}",
        )
    
    if book is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"해당 ISBN의 도서를 찾을 수 없습니다: {isbn}",
        )
    
    return book


@router.get(
    "/bestsellers",
    response_model=AladinSearchResponse,
    summary="베스트셀러 조회",
    description="알라딘 베스트셀러 목록을 조회합니다.",
)
async def get_bestsellers(
    category_id: int = Query(default=0, description="카테고리 ID (0=전체)"),
    max_results: int = Query(default=10, ge=1, le=50, description="최대 결과 수"),
):
    aladin = get_aladin_service()
    
    if not aladin._is_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="알라딘 API 키가 설정되지 않았습니다.",
        )
    
    try:
        result = await aladin.get_bestsellers(category_id, max_results)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"알라딘 API 호출 실패: {str(e)}",
        )