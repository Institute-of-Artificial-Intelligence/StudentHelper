import os
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
import hashlib

class QdrantManager:
    def __init__(self, collection_name="universities"):
        self.client = QdrantClient(
            host=os.getenv("QDRANT_HOST", "localhost"),
            port=int(os.getenv("QDRANT_PORT", 6333))
        )
        self.collection_name = collection_name
        self.embedder = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        
        if not self._collection_exists():
            self._create_collection()

    def _collection_exists(self):
        try:
            self.client.get_collection(self.collection_name)
            return True
        except Exception:
            return False

    def _create_collection(self):
        self.client.create_collection(
            collection_name=self.collection_name,
            vectors_config=VectorParams(
                size=384,
                distance=Distance.COSINE
            )
        )

    def university_exists(self, university_name):
        count = self.client.count(
            collection_name=self.collection_name,
            count_filter={
                "must": [{
                    "key": "university",
                    "match": {"value": university_name}
                }]
            }
        )
        return count.count > 0

    def add_documents(self, documents, university):
        if self.university_exists(university):
            return False

        chunks = []
        for doc in documents:
            chunks.extend(self.text_splitter.split_text(doc))

        embeddings = self.embedder.embed_documents(chunks)
        
        points = []
        for idx, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            point_id = hashlib.md5(f"{university}-{chunk}".encode()).hexdigest()
            points.append({
                "id": point_id,
                "vector": embedding,
                "payload": {
                    "text": chunk,
                    "university": university
                }
            })

        self.client.upsert(
            collection_name=self.collection_name,
            points=points
        )
        return True

    def search(self, query, university=None, limit=3):
        query_embedding = self.embedder.embed_query(query)
        filter = {"must": [{"key": "university", "match": {"value": university}}]} if university else None
        
        results = self.client.search(
            collection_name=self.collection_name,
            query_vector=query_embedding,
            query_filter=filter,
            limit=limit
        )
        
        return [result.payload["text"] for result in results]