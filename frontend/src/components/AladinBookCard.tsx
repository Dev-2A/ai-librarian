import { ExternalLink, Plus } from "lucide-react";
import type { AladinBookItem } from "../types";

interface Props {
  book: AladinBookItem;
  onAddToLibrary?: (book: AladinBookItem) => void;
}

export default function AladinBookCard({ book, onAddToLibrary }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow flex gap-4">
      {/* 표지 이미지 */}
      {book.cover ? (
        <img
          src={book.cover}
          alt={book.title}
          className="w-20 h-28 object-cover rounded-lg shrink-0 bg-gray-100"
        />
      ) : (
        <div className="w-20 h-28 bg-gray-100 rounded-lg shrink-0 flex items-center justify-center text-gray-400 text-xs">
          No Image
        </div>
      )}

      {/* 도서 정보 */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">{book.title}</h3>
        <p className="text-sm text-gray-500 mt-0.5">
          {book.author}
          {book.publisher && (
            <span className="text-gray-400"> · {book.publisher}</span>
          )}
        </p>

        {book.pubDate && (
          <p className="text-xs text-gray-400 mt-1">{book.pubDate}</p>
        )}

        {book.description && (
          <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 mt-2">
            {book.description}
          </p>
        )}

        {book.categoryName && (
          <p className="text-xs text-primary-600 mt-1.5">{book.categoryName}</p>
        )}

        {/* 가격 + 액션 */}
        <div className="flex items-center justify-between mt-3">
          <div className="text-sm">
            {book.priceSales > 0 && (
              <span className="font-medium text-gray-900">
                {book.priceSales.toLocaleString()}원
              </span>
            )}
            {book.priceStandard > 0 &&
              book.priceStandard !== book.priceSales && (
                <span className="ml-1.5 text-xs text-gray-400 line-through">
                  {book.priceStandard.toLocaleString()}원
                </span>
              )}
          </div>

          <div className="flex items-center gap-1.5">
            {onAddToLibrary && (
              <button
                onClick={() => onAddToLibrary(book)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <Plus size={14} />내 서재에 추가
              </button>
            )}
            {book.link && (
              <a
                href={book.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ExternalLink size={14} />
                알라딘
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
