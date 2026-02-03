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
    embedding_model_name: str = "BAAI/bge-m3"

    # Aladin API
    aladin_api_key: str = ""

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }


@lru_cache()
def get_settings() -> Settings:
    return Settings()
