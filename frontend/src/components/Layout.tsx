import { NavLink, Outlet } from "react-router-dom";
import { BookOpen, Search, Sparkles, Library } from "lucide-react";

const navItems = [
  { to: "/", icon: Library, label: "내 서재" },
  { to: "/recommend", icon: Sparkles, label: "AI 추천" },
  { to: "/search", icon: Search, label: "도서 검색" },
  { to: "/add", icon: BookOpen, label: "도서 등록" },
];

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ── 헤더 ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2 group">
            <span className="text-2xl">📚</span>
            <span className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
              AI 사서
            </span>
          </NavLink>

          <nav className="flex items-center gap-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`
                }
              >
                <Icon size={18} />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* ── 메인 콘텐츠 ── */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        <Outlet />
      </main>

      {/* ── 푸터 ── */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
          도서 DB 제공 :{" "}
          <a
            href="https://www.aladin.co.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:underline"
          >
            알라딘 인터넷서점
          </a>
          <span className="mx-2">·</span>
          Powered by Qwen3-Embedding
        </div>
      </footer>
    </div>
  );
}
