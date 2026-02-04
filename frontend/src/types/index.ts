/* ── 도서 ── */
export interface BookCreateRequest {
  title: string;
  author: string;
  isbn?: string;
  review: string;
  rating: number;
  tags: string[];
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string | null;
  review: string;
  rating: number;
  tags: string[];
  created_at: string;
}

/* ── 추천 ── */
export interface Recommendation {
  book: Book;
  score: number;
}

/* ── 알라딘 ── */
export interface AladinBookItem {
  title: string;
  author: string;
  publisher: string;
  pubDate: string;
  description: string;
  isbn: string;
  isbn13: string;
  cover: string;
  link: string;
  categoryName: string;
  priceStandard: number;
  priceSales: number;
}

export interface AladinSearchResponse {
  totalResults: number;
  startIndex: number;
  itemsPerPage: number;
  items: AladinBookItem[];
}
