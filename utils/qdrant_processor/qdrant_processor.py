import os
import time
import hashlib
import re
from dotenv import load_dotenv
from langchain_community.embeddings.yandex import YandexGPTEmbeddings
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct, Filter, FieldCondition, MatchValue

# Загрузка переменных окружения
load_dotenv()

class QdrantProcessor:
    def __init__(self, collection_name="university_docs", vector_size=256):
        self.qdrant = QdrantClient(
            url=os.getenv("QDRANT_URL"),
            api_key=os.getenv("QDRANT_API_KEY")
        )
        self.collection_name = collection_name
        self.embeddings = YandexGPTEmbeddings(
            api_key=os.getenv("YANDEX_API_KEY"),
            folder_id=os.getenv("YANDEX_FOLDER_ID")
        )
        self.vector_size = vector_size
        self._ensure_collection()

    def _ensure_collection(self):
        try:
            self.qdrant.get_collection(self.collection_name)
            print(f"Коллекция '{self.collection_name}' уже существует.")
        except Exception:
            print(f"Создаём коллекцию '{self.collection_name}'...")
            self.qdrant.create_collection(
                collection_name=self.collection_name,
                vectors_config={"size": self.vector_size, "distance": "Cosine"}
            )

    def _generate_id(self, text):
        return int(hashlib.sha256(text.encode("utf-8")).hexdigest(), 16) % (10 ** 12)

    def _is_uploaded(self, doc_id):
        try:
            result = self.qdrant.scroll(
                collection_name=self.collection_name,
                scroll_filter=Filter(
                    must=[FieldCondition(key="doc_id", match=MatchValue(value=doc_id))]
                ),
                limit=1
            )
            return len(result[0]) > 0
        except Exception:
            return False

    def upload_text(self, text: str):
        cleaned = text.replace("\n", " ").strip()
        doc_id = self._generate_id(cleaned)

        if self._is_uploaded(doc_id):
            print(f"Документ уже загружен (doc_id={doc_id})")
            return

        vector = self.embeddings.embed_documents([cleaned])[0]

        point = PointStruct(
            id=doc_id,
            vector=vector,
            payload={
                "text": cleaned,
                "doc_id": doc_id
            }
        )
        self.qdrant.upsert(collection_name=self.collection_name, points=[point])
        print("Текст успешно загружен в Qdrant.")

    @staticmethod
    def keyword_score(text: str, query: str) -> float:
        query = query.lower()
        text = text.lower()
        return len(re.findall(re.escape(query), text))

    def search(self, query: str, limit: int = 1, rerank_limit: int = 20):
        vector = self.embeddings.embed_documents([query])[0]
        filters = []

        result = self.qdrant.search(
            collection_name=self.collection_name,
            query_vector=vector,
            limit=rerank_limit,
            query_filter=Filter(must=filters) if filters else None,
            with_payload=True
        )

        reranked = sorted(
            result,
            key=lambda r: self.keyword_score(r.payload.get('text', ''), query),
            reverse=True
        )

        return [
            {
                "score": r.score,
                "text": r.payload.get("text", "")
            } for r in reranked[:limit]
        ]

if __name__ == '__main__':
    qdrant_db = QdrantProcessor()
    # Пример загрузки и поиска
    #qdrant_db.upload_text("Python - язык программирования")
    print(qdrant_db.search("экология и природопользование и python"))