from datetime import datetime, timezone
from uuid import uuid4
from elasticsearch import AsyncElasticsearch
from app.core.config import get_settings
from app.schemas.book import BookCreateRequest, BookDocument, BookResponse, RecommendationResponse
from app.services.embedding import get_embedding_service

settings = get_settings()


class ElasticsearchService:
    """Elasticsearch 벡터 검색 서비스"""
    
    def __init__(self):
        self.es = AsyncElasticsearch(hosts=[settings.es_host])
        self.index = settings.es_index
        self.dimension = settings.embedding_dimension
    
    # ── 인덱스 관리 ──
    
    async def create_index_if_not_exists(self) -> None:
        """벡터 검색용 인덱스를 생성합니다."""
        if await self.es.indices.exists(index=self.index):
            print(f"📂 Index '{self.index}' already exists")
            return
        
        mappings = {
            "mappings": {
                "properties": {
                    "id": {"type" : "keyword"},
                    "title": {
                        "type": "text",
                        "analyzer": "standard",
                        "fields": {
                            "keyword": {"type": "keyword"}
                        },
                    },
                    "author": {
                        "type": "text",
                        "analyzer": "standard",
                        "fields": {
                            "keyword": {"type": "keyword"}
                        },
                    },
                    "isbn": {"type": "keyword"},
                    "review": {"type": "text", "analyzer": "standard"},
                    "rating": {"type": "float"},
                    "tags": {"type": "keyword"},
                    "embedding": {
                        "type": "dense_vector",
                        "dims": self.dimension,
                        "index": True,
                        "similarity": "cosine",
                    },
                    "created_at": {"type": "date"},
                }
            }
        }
        
        await self.es.indices.create(index=self.index, body=mappings)
        print(f"✅ Index '{self.index}' created (dims={self.dimension})")
    
    async def delete_index(self) -> None:
        """인덱스를 삭제합니다. (개발용)"""
        if await self.es.indices.exists(index=self.index):
            await self.es.indices.delete(index=self.index)
            print(f"🗑️ Index '{self.index}' deleted")
    
    # ── 문서 CRUD ──
    
    async def index_book(self, request: BookCreateRequest) -> BookResponse:
        """
        도서를 임베딩하여 ES에 저장합니다.
        제목 + 저자 + 감상평을 하나의 텍스트로 합쳐서 문서 벡터를 생성합니다.
        """
        embedding_service = get_embedding_service()
        
        # 문서용 텍스트 조합
        doc_text = f"{request.title} - {request.author}. {request.review}"
        embedding = embedding_service.encode_document(doc_text)
        
        doc_id = str(uuid4())
        now = datetime.now(timezone.utc)
        
        document = BookDocument(
            id=doc_id,
            title=request.title,
            author=request.author,
            isbn=request.isbn,
            review=request.review,
            rating=request.rating,
            tags=request.tags,
            embedding=embedding,
            created_at=now,
        )
        
        await self.es.index(
            index=self.index,
            id=doc_id,
            document=document.model_dump(),
        )
        
        # 즉시 검색 가능하도록 refresh
        await self.es.indices.refresh(index=self.index)
        
        return BookResponse(
            id=doc_id,
            title=document.title,
            author=document.author,
            isbn=document.isbn,
            review=document.review,
            rating=document.rating,
            tags=document.tags,
            created_at=document.created_at,
        )
    
    async def get_book(self, book_id: str) -> BookResponse | None:
        """ID로 도서를 조회합니다."""
        try:
            result = await self.es.get(index=self.index, id=book_id)
            source = result["_source"]
            return BookResponse(
                id=source["id"],
                title=source["title"],
                author=source["author"],
                isbn=source.get("isbn"),
                review=source["review"],
                rating=source["rating"],
                tags=source.get("tags", []),
                created_at=source["created_at"],
            )
        except Exception:
            return None
    
    async def get_all_books(self, size: int = 100) -> list[BookResponse]:
        """등록된 모든 도서를 조회합니다."""
        result = await self.es.search(
            index=self.index,
            body={
                "query": {"match_all": {}},
                "size": size,
                "sort": [{"created_at": {"order": "desc"}}],
            },
        )
        
        books = []
        for hit in result["hits"]["hits"]:
            source = hit["_source"]
            books.append(
                BookResponse(
                    id=source["id"],
                    title=source["title"],
                    author=source["author"],
                    isbn=source.get("isbn"),
                    review=source["review"],
                    rating=source["rating"],
                    tags=source.get("tags", []),
                    created_at=source["created_at"],
                )
            )
        return books
    
    async def delete_book(self, book_id: str) -> bool:
        """도서를 삭제합니다."""
        try:
            await self.es.delete(index=self.index, id=book_id)
            await self.es.indices.refresh(index=self.index)
            return True
        except Exception:
            return False
    
    # ── 벡터 검색 (추천) ──
    
    async def search_similar_by_vector(
        self,
        query_vector: list[float],
        top_k: int = 5,
        exclude_id: str | None = None,
    ) -> list[RecommendationResponse]:
        """
        벡터 유사도 기반으로 유사 도서를 검색합니다.
        ES의 kNN 검색을 사용합니다.
        """
        knn_query = {
            "field": "embedding",
            "query_vector": query_vector,
            "k": top_k + (1 if exclude_id else 0),  # 자기 자신 제외 대비
            "num_candidates": max(top_k * 10, 100),
        }
        
        result = await self.es.search(
            index=self.index,
            knn=knn_query,
            size=top_k + (1 if exclude_id else 0),
        )
        
        recommendations = []
        for hit in result["hits"]["hits"]:
            source = hit["_source"]
            
            # 자기 자신 제외
            if exclude_id and source["id"] == exclude_id:
                continue
            
            book = BookResponse(
                id=source["id"],
                title=source["title"],
                author=source["author"],
                isbn=source.get("isbn"),
                review=source["review"],
                rating=source["rating"],
                tags=source.get("tags", []),
                created_at=source["created_at"],
            )
            recommendations.append(
                RecommendationResponse(
                    book=book,
                    score=round(hit["_score"], 4),
                )
            )
            
            if len(recommendations) >= top_k:
                break
        
        return recommendations
    
    async def search_similar_by_review(
        self,
        review: str,
        top_k: int = 5,
    ) -> list[RecommendationResponse]:
        """감상평 텍스트로 유사 도서를 추천합니다."""
        embedding_service = get_embedding_service()
        query_vector = embedding_service.encode_review(review)
        return await self.search_similar_by_vector(query_vector, top_k)
    
    async def search_similar_by_book_id(
        self,
        book_id: str,
        top_k: int = 5,
    ) -> list[RecommendationResponse] | None:
        """기존 등록 도서 기준으로 유사 도서를 추천합니다."""
        try:
            result = await self.es.get(index=self.index, id=book_id)
            source = result["_source"]
            query_vector = source["embedding"]
            return await self.search_similar_by_vector(
                query_vector, top_k, exclude_id=book_id
            )
        except Exception:
            return None
    
    # ── 연결 관리 ──
    
    async def ping(self) -> bool:
        """ES 연결 상태를 확인합니다."""
        try:
            return await self.es.ping()
        except Exception:
            return False
    
    async def close(self) -> None:
        """ES 클라이언트 연결을 종료합니다."""
        await self.es.close()


# ── 싱글톤 인스턴스 ──
_es_service: ElasticsearchService | None = None


def get_es_service() -> ElasticsearchService:
    global _es_service
    if _es_service is None:
        _es_service = ElasticsearchService()
    return _es_service