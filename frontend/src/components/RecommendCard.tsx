import type { Recommendation } from "../types";
import StarRating from "./StarRating";
import TagBadge from "./TagBadge";

interface Props {
  recommendation: Recommendation;
  rank: number;
}

export default function RecommendCard({ recommendation, rank }: Props) {
  const { book, score } = recommendation;
  const percentage = Math.round(score * 100);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow relative">
      {/* 순위 뱃지 */}
      <div
        className={`absolute -top-2.5 -left-2.5 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
          rank === 1
            ? "bg-warm-500"
            : rank === 2
              ? "bg-gray-400"
              : rank === 3
                ? "bg-amber-700"
                : "bg-gray-300"
        }`}
      >
        {rank}
      </div>

      {/* 유사도 바 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1 mr-3">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
        <span className="text-sm font-semibold text-primary-600 tabular-nums shrink-0">
          {percentage}% 일치
        </span>
      </div>

      {/* 도서 정보 */}
      <h3 className="font-semibold text-gray-900 mb-1">{book.title}</h3>
      <p className="text-sm text-gray-500 mb-2">{book.author}</p>

      <div className="mb-3">
        <StarRating value={book.rating} readonly size={14} />
      </div>

      <p className="text-sm text-gray-700 leading-relaxed line-clamp-2 mb-3">
        {book.review}
      </p>

      {book.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {book.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}
    </div>
  );
}
