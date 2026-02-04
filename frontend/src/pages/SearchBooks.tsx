import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import toast from "react-hot-toast";
import { aladinApi } from "../api";
import type { AladinBookItem, AladinSearchResponse } from "../types";
import AladinBookCard from "../components/AladinBookCard";
import LoadingSpinner from "../components/LoadingSpinner";

export default function SearchBooks() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AladinSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error("검색어를 입력해 주세요.");
      return;
    }

    try {
      setLoading(true);
      setSearched(true);
      const data = await aladinApi.search(query.trim(), 20);
      setResults(data);
      if (data.items.length === 0) {
        toast("검색 결과가 없습니다.", { icon: "🔍" });
      }
    } catch (err: any) {
      if (err?.response?.status === 503) {
        toast.error(
          "알라딘 API 키가 설정되지 않았습니다. 백엔드 .env를 확인해 주세요.",
        );
      } else {
        toast.error("도서 검색에 실패했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddToLibrary = (book: AladinBookItem) => {
    // 검색 결과의 도서 정보를 state로 넘겨서 등록 폼 자동 채움
    navigate("/add", {
      state: {
        title: book.title,
        author: book.author,
        isbn: book.isbn13 || book.isbn,
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">🔍 도서 검색</h1>

      {/* 검색 폼 */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="도서명, 저자, ISBN으로 검색..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            검색
          </button>
        </div>
      </form>

      {/* 결과 */}
      {loading && <LoadingSpinner message="알라딘에서 검색 중..." />}

      {!loading && results && results.items.length > 0 && (
        <div>
          <p className="text-sm text-gray-500 mb-4">
            총 {results.totalResults.toLocaleString()}건 중{" "}
            {results.items.length}건 표시
          </p>
          <div className="space-y-3">
            {results.items.map((book, i) => (
              <AladinBookCard
                key={`${book.isbn13 || book.isbn}-${i}`}
                book={book}
                onAddToLibrary={handleAddToLibrary}
              />
            ))}
          </div>

          {/* 알라딘 출처 표기 */}
          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-400">
              도서 DB 제공 :{" "}
              <a
                href="https://www.aladin.co.kr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-500 hover:underline"
              >
                알라딘 인터넷서점(www.aladin.co.kr)
              </a>
            </p>
          </div>
        </div>
      )}

      {!loading && searched && results && results.items.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">검색 결과가 없습니다.</p>
          <p className="text-sm text-gray-400 mt-1">
            다른 검색어로 시도해 보세요.
          </p>
        </div>
      )}
    </div>
  );
}
