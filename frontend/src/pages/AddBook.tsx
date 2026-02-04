import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Send, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { bookApi } from "../api";
import type { BookCreateRequest } from "../types";
import StarRating from "../components/StarRating";
import TagBadge from "../components/TagBadge";

const initialForm: BookCreateRequest = {
  title: "",
  author: "",
  isbn: "",
  review: "",
  rating: 0,
  tags: [],
};

export default function AddBook() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState<BookCreateRequest>(initialForm);
  const [tagInput, setTagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 검색 페이지에서 넘어온 도서 정보 자동 채우기
  useEffect(() => {
    const state = location.state as {
      title?: string;
      author?: string;
      isbn?: string;
    } | null;

    if (state) {
      setForm((prev) => ({
        ...prev,
        title: state.title || prev.title,
        author: state.author || prev.author,
        isbn: state.isbn || prev.isbn,
      }));
      // state 소비 후 히스토리에서 제거 (뒤로 갔다 돌아왔을 때 중복 방지)
      window.history.replaceState({}, document.title);
      toast.success("도서 정보가 자동으로 입력되었습니다!");
    }
  }, [location.state]);

  const updateField = <K extends keyof BookCreateRequest>(
    key: K,
    value: BookCreateRequest[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (!tag) return;
    if (form.tags.includes(tag)) {
      toast.error("이미 추가된 태그입니다.");
      return;
    }
    if (form.tags.length >= 10) {
      toast.error("태그는 최대 10개까지 추가할 수 있습니다.");
      return;
    }
    updateField("tags", [...form.tags, tag]);
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    updateField(
      "tags",
      form.tags.filter((t) => t !== tag),
    );
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!form.title.trim()) return toast.error("제목을 입력해 주세요.");
    if (!form.author.trim()) return toast.error("저자를 입력해 주세요.");
    if (!form.review.trim()) return toast.error("감상평을 입력해 주세요.");
    if (form.rating === 0) return toast.error("별점을 선택해 주세요.");

    try {
      setSubmitting(true);
      const created = await bookApi.create({
        ...form,
        isbn: form.isbn || undefined,
      });
      toast.success(`"${created.title}" 등록 완료!`);
      navigate("/");
    } catch {
      toast.error("도서 등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">📖 도서 등록</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 제목 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="예: 데미안"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow"
          />
        </div>

        {/* 저자 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            저자 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.author}
            onChange={(e) => updateField("author", e.target.value)}
            placeholder="예: 헤르만 헤세"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow"
          />
        </div>

        {/* ISBN (선택) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            ISBN <span className="text-gray-400 font-normal">(선택)</span>
          </label>
          <input
            type="text"
            value={form.isbn}
            onChange={(e) => updateField("isbn", e.target.value)}
            placeholder="예: 9788937460449"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow"
          />
        </div>

        {/* 별점 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            별점 <span className="text-red-500">*</span>
          </label>
          <StarRating
            value={form.rating}
            onChange={(v) => updateField("rating", v)}
            size={28}
          />
        </div>

        {/* 감상평 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            감상평 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.review}
            onChange={(e) => updateField("review", e.target.value)}
            placeholder="이 책을 읽고 느낀 점, 인상 깊었던 부분 등을 자유롭게 적어주세요. 감상평이 상세할수록 더 정확한 추천을 받을 수 있어요."
            rows={5}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow resize-none"
          />
          <p className="mt-1 text-xs text-gray-400">
            {form.review.length}자 입력됨
          </p>
        </div>

        {/* 태그 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            태그 <span className="text-gray-400 font-normal">(선택)</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="태그 입력 후 Enter 또는 추가 버튼"
              className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-3 py-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {form.tags.map((tag) => (
                <TagBadge key={tag} tag={tag} onRemove={() => removeTag(tag)} />
              ))}
            </div>
          )}
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? (
            <>
              <span className="animate-spin">⏳</span>
              임베딩 생성 중...
            </>
          ) : (
            <>
              <Send size={18} />
              도서 등록하기
            </>
          )}
        </button>
      </form>
    </div>
  );
}
