import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Sparkles, Send, BookOpen } from "lucide-react";
import toast from "react-hot-toast";
import { recommendApi, bookApi } from "../api";
import type { Recommendation, Book } from "../types";
import RecommendCard from "../components/RecommendCard";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Recommend() {
  const [searchParams] = useSearchParams();
  const bookIdFromQuery = searchParams.get("bookId");

  const [mode, setMode] = useState<"review" | "book">(
    bookIdFromQuery ? "book" : "review",
  );
  const [reviewInput, setReviewInput] = useState("");
  const [results, setResults] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // 도서 기반 추천용 상태
  const [myBooks, setMyBooks] = useState<Book[]>([]);
  const [selectedBookId, setSelectedBookId] = useState(bookIdFromQuery || "");
  const [booksLoading, setBooksLoading] = useState(false);

  // 내 서재 도서 목록 로드
  useEffect(() => {
    if (mode === "book") {
      setBooksLoading(true);
      bookApi
        .getAll()
        .then(setMyBooks)
        .catch(() => toast.error("도서 목록을 불러오지 못했습니다."))
        .finally(() => setBooksLoading(false));
    }
  }, [mode]);

  // URL에서 bookId가 넘어온 경우 자동 추천 실행
  useEffect(() => {
    if (bookIdFromQuery && mode === "book") {
      handleBookRecommend(bookIdFromQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookIdFromQuery]);

  const handleReviewRecommend = async () => {
    if (!reviewInput.trim()) {
      toast.error("감상평이나 원하는 취향을 입력해 주세요.");
      return;
    }

    try {
      setLoading(true);
      setSearched(true);
      const data = await recommendApi.byReview(reviewInput.trim());
      setResults(data);
      if (data.length === 0) {
        toast("추천할 도서가 없습니다. 도서를 더 등록해 보세요.", {
          icon: "📚",
        });
      }
    } catch {
      toast.error("추천 요청에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookRecommend = async (bookId?: string) => {
    const id = bookId || selectedBookId;
    if (!id) {
      toast.error("도서를 선택해 주세요.");
      return;
    }

    try {
      setLoading(true);
      setSearched(true);
      const data = await recommendApi.byBook(id);
      setResults(data);
      if (data.length === 0) {
        toast("유사한 도서가 없습니다. 도서를 더 등록해 보세요.", {
          icon: "📚",
        });
      }
    } catch {
      toast.error("추천 요청에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "review") {
      handleReviewRecommend();
    } else {
      handleBookRecommend();
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">✨ AI 추천</h1>

      {/* 모드 탭 */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-6">
        <button
          onClick={() => {
            setMode("review");
            setResults([]);
            setSearched(false);
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-md text-sm font-medium transition-colors ${
            mode === "review"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Sparkles size={16} />
          감상평으로 추천
        </button>
        <button
          onClick={() => {
            setMode("book");
            setResults([]);
            setSearched(false);
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-md text-sm font-medium transition-colors ${
            mode === "book"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <BookOpen size={16} />
          도서 기반 추천
        </button>
      </div>

      {/* 입력 폼 */}
      <form onSubmit={handleSubmit} className="mb-8">
        {mode === "review" ? (
          <div className="space-y-3">
            <textarea
              value={reviewInput}
              onChange={(e) => setReviewInput(e.target.value)}
              placeholder="어떤 책을 읽고 싶으신가요? 원하는 분위기, 장르, 감정 등을 자유롭게 적어주세요.&#10;&#10;예: 내면의 성장과 자아를 찾아가는 철학적인 소설이 읽고 싶다."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow resize-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
              추천 받기
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {booksLoading ? (
              <div className="text-sm text-gray-400 py-4 text-center">
                도서 목록 불러오는 중...
              </div>
            ) : myBooks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-3">등록된 도서가 없습니다.</p>
                <Link
                  to="/add"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  도서 등록하러 가기
                </Link>
              </div>
            ) : (
              <>
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow bg-white"
                >
                  <option value="">도서를 선택하세요</option>
                  {myBooks.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.title} — {book.author}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={loading || !selectedBookId}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Sparkles size={18} />
                  유사 도서 찾기
                </button>
              </>
            )}
          </div>
        )}
      </form>

      {/* 결과 */}
      {loading && <LoadingSpinner message="AI가 추천 도서를 찾고 있어요..." />}

      {!loading && searched && results.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            📖 추천 결과
            <span className="ml-2 text-sm font-normal text-gray-500">
              {results.length}권
            </span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {results.map((rec, i) => (
              <RecommendCard
                key={rec.book.id}
                recommendation={rec}
                rank={i + 1}
              />
            ))}
          </div>
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">
            추천 결과가 없습니다. 도서를 더 등록하면 정확도가 올라갑니다.
          </p>
        </div>
      )}
    </div>
  );
}
