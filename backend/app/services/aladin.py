import httpx
from app.core.config import get_settings
from app.schemas.aladin import AladinBookItem, AladinSearchResponse

settings = get_settings()

BASE_URL = "http://www.aladin.co.kr/ttb/api"


class AladinService:
    """알라딘 Open API 서비스"""
    
    def __init__(self):
        self.ttb_key = settings.aladin_api_key
        self.timeout = httpx.Timeout(10.0)
    
    def _is_available(self) -> bool:
        """API 키가 설정되어 있는지 확인"""
        return bool(self.ttb_key)
    
    def _base_params(self) -> dict:
        """공통 요청 파라미터"""
        return {
            "ttbkey": self.ttb_key,
            "output": "js",             # JSON 형식
            "Version": "20131101",
            "SearchTarget": "Book",
        }
    
    async def search_books(
        self,
        query: str,
        query_type: str = "Keyword",
        max_results: int = 10,
        start: int = 1,
    ) -> AladinSearchResponse:
        """
        도서 검색
        
        Args:
            query: 검색어
            query_type: 검색 유형 (Keyword, Title, Author, Publisher)
            max_results: 최대 결과 수 (1~50)
            start: 시작 페이지 (1~)
        """
        if not self._is_available():
            return AladinSearchResponse()
        
        params = {
            **self._base_params(),
            "Query": query,
            "QueryType": query_type,
            "MaxResults": min(max_results, 50),
            "start": start,
        }
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(
                f"{BASE_URL}/ItemSearch.aspx", params=params
            )
            response.raise_for_status()
            data = response.json()
        
        return AladinSearchResponse(**data)
    
    async def lookup_by_isbn(self, isbn: str) -> AladinBookItem | None:
        """
        ISBN으로 도서 상세 조회
        
        Args:
            isbn: ISBN10 또는 ISBN13
        """
        if not self._is_available():
            return None
        
        # ISBN 길이로 타입 판별
        id_type = "ISBN13" if len(isbn) == 13 else "ISBN"
        
        params = {
            **self._base_params(),
            "itemIdType": id_type,
            "ItemId": isbn,
        }
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(
                f"{BASE_URL}/ItemLookUp.aspx", params=params
            )
            response.raise_for_status()
            data = response.json()
        
        items = data.get("item", [])
        if not items:
            return None
        
        return AladinBookItem(**items[0])
    
    async def get_bestsellers(
        self,
        category_id: int = 0,
        max_results: int = 10,
    ) -> AladinSearchResponse:
        """
        베스트셀러 목록 조회
        
        Args:
            category_id: 카테고리 ID (0 = 전체)
            max_results: 최대 결과 수
        """
        if not self._is_available():
            return AladinSearchResponse()
        
        params = {
            **self._base_params(),
            "QueryType": "Bestseller",
            "MaxResults": min(max_results, 50),
            "start": 1,
            "CategoryId": category_id,
        }
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(
                f"{BASE_URL}/ItemList.aspx", params=params
            )
            response.raise_for_status()
            data = response.json()
        
        return AladinSearchResponse(**data)


# ── 싱글톤 인스턴스 ──
_aladin_service: AladinService | None = None


def get_aladin_service() -> AladinService:
    global _aladin_service
    if _aladin_service is None:
        _aladin_service = AladinService()
    return _aladin_service