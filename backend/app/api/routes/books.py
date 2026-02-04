from fastapi import APIRouter, HTTPException, status
from app.schemas.book import BookCreateRequest, BookResponse
from app.services.elasticsearch import get_es_service

router = APIRouter(prefix="/books", tags=["도서 관리"])


@router.post(
    "",
    response_model=BookResponse,
    status_code=status.HTTP_201_CREATED,
    summary="도서 등록",
    description="도서 정보와 감상평을 등록합니다. 감상평은 임베딩되어 벡터 검색에 사용됩니다.",
)
async def create_book(request: BookCreateRequest):
    es = get_es_service()
    
    if not await es.ping():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Elasticsearch가 연결되어 있지 않습니다.",
        )
    
    book = await es.index_book(request)
    return book


@router.get(
    "",
    response_model=list[BookResponse],
    summary="도서 목록 조회",
    description="등록된 모든 도서를 최신순으로 조회합니다.",
)
async def get_books():
    es = get_es_service()
    return await es.get_all_books()


@router.get(
    "/{book_id}",
    response_model=BookResponse,
    summary="도서 상세 조회",
    description="ID로 특정 도서를 조회합니다.",
)
async def get_book(book_id: str):
    es = get_es_service()
    book = await es.get_book(book_id)
    
    if book is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"도서를 찾을 수 없습니다: {book_id}",
        )
    
    return book


@router.delete(
    "/{book_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="도서 삭제",
    description="등록된 도서를 삭제합니다.",
)
async def delete_book(book_id: str):
    es = get_es_service()
    deleted = await es.delete_book(book_id)
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"도서를 찾을 수 없습니다: {book_id}",
        )