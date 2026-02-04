import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { bookApi } from "../api";
import type { Book } from "../types";
import BookCard from "../components/BookCard";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";

export default function MyLibrary() {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const data = await bookApi.getAll();
      setBooks(data);
    } catch {
      toast.error("도서 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleDelete = async (id: string) => {
    const book = books.find((b) => b.id === id);
    if (!book) return;

    const confirmed = window.confirm(
      `"${book.title}"을(를) 정말 삭제하시겠습니까?`,
    );
    if (!confirmed) return;

    try {
      await bookApi.delete(id);
      setBooks((prev) => prev.filter((b) => b.id !== id));
      toast.success(`"${book.title}" 삭제 완료`);
    } catch {
      toast.error("삭제에 실패했습니다.");
    }
  };

  const handleRecommend = (bookId: string) => {
    navigate(`/recommend?bookId=${bookId}`);
  };

  if (loading) return <LoadingSpinner message="서재를 불러오는 중..." />;

  if (books.length === 0) {
    return (
      <EmptyState
        title="아직 등록된 도서가 없어요"
        description="읽은 책과 감상평을 등록하고 AI 추천을 받아보세요."
        actionLabel="첫 번째 도서 등록하기"
        actionTo="/add"
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          📚 내 서재
          <span className="ml-2 text-base font-normal text-gray-500">
            {books.length}권
          </span>
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            onDelete={handleDelete}
            onRecommend={handleRecommend}
          />
        ))}
      </div>
    </div>
  );
}
