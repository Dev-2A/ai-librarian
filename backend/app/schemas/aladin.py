from pydantic import BaseModel, Field


class AladinBookItem(BaseModel):
    """알라딘 API 응답의 개별 도서 항목"""
    title: str = ""
    author: str = ""
    publisher: str = ""
    pub_date: str = Field(default="", alias="pubDate")
    description: str = ""
    isbn: str = ""
    isbn13: str = ""
    cover: str = ""         # 표지 이미지 URL
    link: str = ""          # 알라딘 상품 페이지 URL
    category_name: str = Field(default="", alias="categoryName")
    price_standard: int = Field(default=0, alias="priceStandard")
    price_sales: int = Field(default=0, alias="priceSales")
    
    model_config = {"populate_by_name": True}


class AladinSearchResponse(BaseModel):
    """알라딘 검색 API 응답"""
    version: str = ""
    title: str = ""
    total_results: int = Field(default=0, alias="totalResults")
    start_index: int = Field(default=0, alias="startIndex")
    items_per_page: int = Field(default=0, alias="itemsPerPage")
    items: list[AladinBookItem] = Field(default=[], alias="item", serialization_alias="items")
    
    model_config = {"populate_by_name": True}