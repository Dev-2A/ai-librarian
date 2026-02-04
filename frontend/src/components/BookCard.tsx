import { Trash2, Sparkles } from "lucide-react";
import type { Book } from "../types";
import StarRating from "./StarRating";
import TagBadge from "./TagBadge";

interface Props {
  book: Book;
  onDelete?: (id: string) => void;
  onRecommend?: (id: string) => void;
}

export default function BookCard({ book, onDelete, onRecommend }: Props) {
  const formattedDate = new Date(book.created_at).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      {/* 상단: 제목 + 액션 */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{book.title}</h3>
          <p className="text-sm text-gray-500">{book.author}</p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {onRecommend && (
            <button
              onClick={() => onRecommend(book.id)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
              title="유사 도서 추천"
            >
              <Sparkles size={16} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(book.id)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="삭제"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* 별점 */}
      <div className="mb-3">
        <StarRating value={book.rating} readonly size={16} />
      </div>

      {/* 감상평 */}
      <p className="text-sm text-gray-700 leading-relaxed line-clamp-3 mb-3">
        {book.review}
      </p>

      {/* 태그 + 날짜 */}
      <div className="flex items-end justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {book.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
        <span className="text-xs text-gray-400 shrink-0">{formattedDate}</span>
      </div>
    </div>
  );
}
