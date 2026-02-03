from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Server
    app_host: str = "0.0.0.0"
    app_port: int = 8000

    # Elasticsearch
    es_host: str = "http://localhost:9200"
    es_index: str = "books"

    # Embedding Model
    embedding_model_name: str = "Qwen/Qwen3-Embedding-0.6B"
    embedding_dimension: int = 1024     # MRL 지원: 256, 512, 1024 중 선택
    embedding_device: str = "cpu"       # "cpu" 또는 "cuda"

    # Aladin API
    aladin_api_key: str = ""

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }


@lru_cache()
def get_settings() -> Settings:
    return Settings()
