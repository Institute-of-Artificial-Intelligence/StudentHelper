# Импорты стандартных и сторонних библиотек
import os
import time
import hashlib
from dotenv import load_dotenv
from langchain_community.embeddings.yandex import YandexGPTEmbeddings
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct, Filter, FieldCondition, MatchValue

# Загрузка переменных окружения из .env файла
load_dotenv()

class QdrantProcessor:
    def __init__(self, collection_name="university_docs", vector_size=256):
        # Инициализация клиента Qdrant с URL и API-ключом из окружения
        self.qdrant = QdrantClient(
            url=os.getenv("QDRANT_URL"),
            api_key=os.getenv("QDRANT_API_KEY")
        )
        self.collection_name = collection_name

        # Инициализация эмбеддингов от YandexGPT
        self.embeddings = YandexGPTEmbeddings(
            api_key=os.getenv("YANDEX_API_KEY"),
            folder_id=os.getenv("YANDEX_FOLDER_ID")
        )
        self.vector_size = vector_size

        # Убедимся, что коллекция существует или создадим её
        self._ensure_collection()

    def _ensure_collection(self):
        """Проверяет, существует ли коллекция, и создаёт её при необходимости."""
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
        """Генерирует уникальный идентификатор на основе текста."""
        return int(hashlib.sha256(text.encode("utf-8")).hexdigest(), 16) % (10 ** 12)

    def _is_uploaded(self, doc_id):
        """Проверяет, был ли уже загружен документ с данным ID."""
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

    def process_pdf(self, file_path):
        """Загружает PDF и разбивает его на фрагменты текста."""
        loader = PyPDFLoader(file_path)
        documents = loader.load()

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,      # Длина одного фрагмента
            chunk_overlap=200     # Перекрытие между фрагментами
        )
        return text_splitter.split_documents(documents)

    def upload_document(self, file_path):
        """Обрабатывает и загружает PDF-документ в коллекцию."""
        university = os.path.basename(os.path.dirname(file_path))  # Определяет вуз из пути
        print(f"Обработка PDF для вуза: {university}")
        
        texts = self.process_pdf(file_path)
        points = []

        for text in texts:
            cleaned = text.page_content.replace("\n", " ").strip()  # Очистка текста
            doc_id = self._generate_id(cleaned)

            # Пропускаем, если документ уже загружен
            if self._is_uploaded(doc_id):
                print(f"Документ уже загружен (doc_id={doc_id})")
                continue

            # Генерация эмбеддинга
            vector = self.embeddings.embed_documents([cleaned])[0]

            # Формирование структуры точки для Qdrant
            point = PointStruct(
                id=doc_id,
                vector=vector,
                payload={
                    "text": cleaned,
                    "doc_id": doc_id,
                    "university": university
                }
            )
            points.append(point)
            time.sleep(0.1)  # Пауза для ограничения частоты запросов к API

        # Отправка всех новых точек в Qdrant
        if points:
            self.qdrant.upsert(collection_name=self.collection_name, points=points)
            print(f"Загружено {len(points)} фрагментов.")
        else:
            print("Нет новых данных для загрузки.")

    def search(self, query: str, university: str = None, limit: int = 1):
        """Выполняет поиск по эмбеддингу запроса, опционально фильтруя по вузу."""
        vector = self.embeddings.embed_documents([query])[0]

        filters = []
        if university:
            filters.append(FieldCondition(
                key="university",
                match=MatchValue(value=university)
            ))

        result = self.qdrant.search(
            collection_name=self.collection_name,
            query_vector=vector,
            limit=limit,
            query_filter=Filter(must=filters) if filters else None
        )

        # Печать результатов
        print(result)


if __name__ == '__main__':
    qdrant_db = QdrantProcessor()
    qdrant_db.search("экология и природопользование")