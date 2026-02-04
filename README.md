# 📚 AI 사서 (AI Librarian)

임베딩 기반 개인 독서 큐레이션 봇.  
읽은 책의 감상평을 등록하면 벡터 유사도로 취향에 맞는 도서를 추천합니다.  

![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Elasticsearch](https://img.shields.io/badge/Elasticsearch-8.15-005571?logo=elasticsearch&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

---

## 주요 기능

- **📖 도서 등록** — 제목, 저자, 감상평, 별점, 태그를 입력하면 임베딩 벡터로 변환하여 저장
- **✨ AI 추천** — 감상평이나 원하는 취향을 입력하면 유사한 도서를 추천
- **🔗 도서 기반 추천** — 이미 등록된 도서와 비슷한 책을 찾아줌
- **🔍 알라딘 도서 검색** — 알라딘 Open API로 도서 검색, 표지·가격 확인 후 바로 내 서재에 추가
- **📚 내 서재** — 등록한 도서를 한눈에 관리

## 기술 스택

| 영역 | 기술 |
|------|------|
| 임베딩 모델 | [Qwen3-Embedding-0.6B](https://huggingface.co/Qwen/Qwen3-Embedding-0.6B) |
| 백엔드 | FastAPI + Pydantic v2 |
| 벡터 검색 | Elasticsearch 8.15 (dense_vector, cosine) |
| 프론트엔드 | React 19 + TypeScript + Tailwind CSS 3 |
| 외부 API | 알라딘 Open API |
| 인프라 | Docker Compose |

## 아키텍처

```text
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend   │────▶│   Backend        │────▶│  Elasticsearch  │
│  React+Nginx │     │   FastAPI        │     │  8.15           │
│  :80         │     │   :8000          │     │  :9200          │
└──────────────┘     │                  │     │                 │
                     │  Qwen3-Embedding │     │  books index    │
                     │  0.6B            │     │  cosine 1024d   │
                     └────────┬─────────┘     └─────────────────┘
                              │
                     ┌────────▼─────────┐
                     │  알라딘 Open API  │
                     │  도서 검색/조회   │
                     └──────────────────┘
```

## 빠른 시작

### 사전 요구사항

- Docker + Docker Compose
- (선택) 알라딘 Open API TTBKey — [발급 안내](https://www.aladin.co.kr/ttb/wblog_manage.aspx)

### 1. 클론

```bash
git clone https://github.com/Dev-2A/ai-librarian.git
cd ai-librarian
```

### 2. 환경변수 설정

```bash
cp backend/.env.example backend/.env
```

`backend/.env`를 열어서 필요한 값을 수정합니다:

```env
APP_HOST=0.0.0.0
APP_PORT=8000
ES_HOST=http://localhost:9200
ES_INDEX=books
EMBEDDING_MODEL_NAME=Qwen/Qwen3-Embedding-0.6B
EMBEDDING_DIMENSION=1024
EMBEDDING_DEVICE=cpu
ALADIN_API_KEY=your_ttb_key_here
```

> GPU가 있다면 `EMBEDDING_DEVICE=cuda`로 변경하세요.

### 3. 실행

**Docker 통합 실행 (권장):**

```bash
docker compose up --build -d

# 로그 확인 (최초 실행 시 모델 다운로드에 수 분 소요)
docker compose logs -f backend
```

| 서비스 | URL |
| --- | --- |
| 프론트엔드 | http://localhost |
| API 문서 (Swagger) | http://localhost:8000/docs |
| Elasticsearch | http://localhost:9200 |

**개발 모드:**

```bash
# ES만 Docker로 실행
docker compose -f docker-compose.dev.yml up -d

# 백엔드 (터미널 1)
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# 프론트엔드 (터미널 2)
cd frontend
npm install
npm run dev
```

개발 모드 접속: http://localhost:5173

### 4. 종료

```bash
docker compose down        # 컨테이너 종료 (데이터 보존)
docker compose down -v     # 데이터까지 초기화
```

## API 엔드포인트

| Method | Endpoint | 설명 |
| --- | --- | --- |
| `GET` | `/health` | 상세 헬스체크 |
| `POST` | `/api/books` | 도서 등록 |
| `GET` | `/api/books` | 도서 목록 조회 |
| `GET` | `/api/books/{id}` | 도서 상세 조회 |
| `DELETE` | `/api/books/{id}` | 도서 삭제 |
| `POST` | `/api/recommendations/by-review` | 감상평 기반 추천 |
| `POST` | `/api/recommendations/by-book` | 도서 기반 추천 |
| `GET` | `/api/aladin/search` | 알라딘 도서 검색 |
| `GET` | `/api/aladin/lookup/{isbn}` | ISBN 도서 조회 |
| `GET` | `/api/aladin/bestsellers` | 베스트셀러 조회 |

## 프로젝트 구조

```text
ai-librarian/
├── backend/
│   ├── Dockerfile
│   ├── .env.example
│   ├── requirements.txt
│   └── app/
│       ├── main.py
│       ├── api/routes/
│       │   ├── books.py
│       │   ├── recommendations.py
│       │   └── aladin.py
│       ├── core/config.py
│       ├── schemas/
│       │   ├── book.py
│       │   ├── recommendation.py
│       │   └── aladin.py
│       └── services/
│           ├── embedding.py
│           ├── elasticsearch.py
│           └── aladin.py
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
│       ├── api/
│       ├── types/
│       ├── components/
│       └── pages/
├── docker-compose.yml
├── docker-compose.dev.yml
├── LICENSE
└── README.md
```

## 임베딩 모델

[Qwen3-Embedding-0.6B](https://huggingface.co/Qwen/Qwen3-Embedding-0.6B)을 사용합니다.

- **파라미터:** 600M
- **임베딩 차원:** 1024 (MRL로 512, 256도 가능)
- **특징:** Instruction-aware — 쿼리에 태스크 지시문을 부여하여 검색 정확도 향상
- **다국어:** 100+ 언어 지원 (한국어 포함)
- **라이선스:** Apache 2.0

쿼리(추천 요청) 시에만 instruction을 부여하고, 문서 저장 시에는 제외합니다:

```text
# 쿼리
Instruct: Given a book review, retrieve books with similar themes and emotions
Query: 내면의 성장과 자아를 찾아가는 철학적인 소설이 읽고 싶다.

# 문서 (instruction 없음)
데미안 | 헤르만 헤세 | 자기 자신을 찾아가는 여정이 인상적이었다...
```

## 알라딘 Open API

도서 검색·표지·가격 정보를 위해 알라딘 Open API를 사용합니다.

- [API 키 발급](https://www.aladin.co.kr/ttb/wblog_manage.aspx)
- 1일 호출 제한: 5,000회
- 키 없이도 임베딩 추천 기능은 정상 동작합니다.

> 도서 DB 제공 : 알라딘 인터넷서점(www.aladin.co.kr)

## 라이선스

MIT License
