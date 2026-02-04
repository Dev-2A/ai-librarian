import torch
import torch.nn.functional as F
from torch import Tensor
from transformers import AutoTokenizer, AutoModel
from app.core.config import get_settings

settings = get_settings()


def _last_token_pool(last_hidden_state: Tensor, attention_mask: Tensor) -> Tensor:
    """Qwen3-Embedding은 마지막 토큰 풀링을 사용합니다."""
    left_padding = attention_mask[:, -1].sum() == attention_mask.shape[0]
    if left_padding:
        return last_hidden_state[:, -1]
    else:
        sequence_lengths = attention_mask.sum(dim=1) - 1
        batch_size = last_hidden_state.shape[0]
        return last_hidden_state[
            torch.arange(batch_size, device=last_hidden_state.device),
            sequence_lengths,
        ]


class EmbeddingService:
    """Qwen3-Embedding 기반 텍스트 임베딩 서비스"""
    
    def __init__(self):
        self.device = settings.embedding_device
        self.dimension = settings.embedding_dimension
        self.model_name = settings.embedding_model_name
        
        print(f"📦 Loading embedding model: {self.model_name}")
        print(f"   Device: {self.device} | Dimension: {self.dimension}")
        
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self.model = AutoModel.from_pretrained(self.model_name).to(self.device)
        self.model.eval()
        
        print("✅ Embedding model loaded successfully")
    
    def _get_instruct(self, task: str, text: str) -> str:
        """Instruction-aware 포맷: 태스크 설명 + 쿼리"""
        return f"Instruct: {task}\nQuery: {text}"
    
    def encode_review(self, review: str) -> list[float]:
        """
        도서 감상평을 임베딩 벡터로 변환합니다.
        - 쿼리(추천 요청) 시: instruction 포함
        """
        task = (
            "Given a book review, r etrieve books with similar themes, "
            "emotions, and reading experience"
        )
        instructed_text = self._get_instruct(task, review)
        return self._encode([instructed_text])[0]
    
    def encode_document(self, text: str) -> list[float]:
        """
        도서 정보(제목+저자+감상평)를 임베딩 벡터로 변환합니다.
        - 문서 저장 시: instruction 없이 인코딩
        """
        return self._encode([text])[0]
    
    def encode_batch(self, texts: list[str], is_query: bool = False) -> list[list[float]]:
        """배치 임베딩"""
        if is_query:
            task = (
                "Given a book review, retrieve books with similar themes, "
                "emotions, and reading experience"
            )
            texts = [self._get_instruct(task, t) for t in texts]
        return self._encode(texts)
    
    def _encode(self, texts: list[str]) -> list[list[float]]:
        """내부 인코딩 로직"""
        batch_dict = self.tokenizer(
            texts,
            max_length=8192,
            padding=True,
            truncation=True,
            return_tensors="pt",
            pad_to_multiple_of=8,
        ).to(self.device)
        
        with torch.no_grad():
            outputs = self.model(**batch_dict)
        
        embeddings = _last_token_pool(
            outputs.last_hidden_state, batch_dict["attention_mask"]
        )
        
        # MRL: 지정된 차원으로 잘라내기
        if self.dimension < embeddings.shape[-1]:
            embeddings = embeddings[:, : self.dimension]
        
        # L2 정규화
        embeddings = F.normalize(embeddings, p=2, dim=1)
        
        return embeddings.cpu().tolist()


# ── 싱글톤 인스턴스 ──
_embedding_service: EmbeddingService | None = None


def get_embedding_service() -> EmbeddingService:
    global _embedding_service
    if _embedding_service is None:
        _embedding_service = EmbeddingService()
    return _embedding_service