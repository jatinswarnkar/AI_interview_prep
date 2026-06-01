"""
RAG Service — FAISS Vector Store + SentenceTransformers.

Provides semantic search over interview preparation documents.
Loads the FAISS index and embedding model lazily (on first call)
and caches them in memory for subsequent requests.

Heavy imports (faiss, sentence_transformers, numpy) are deferred
to avoid OOM on free-tier hosting during Django startup.
"""
import os
import pickle
import logging
from pathlib import Path

from django.conf import settings

logger = logging.getLogger(__name__)


class RAGService:
    """
    Retrieval-Augmented Generation service using FAISS + SentenceTransformers.

    Usage:
        rag = RAGService()
        results = rag.retrieve("system design patterns", top_k=5)
    """

    _instance = None
    _model = None
    _index = None
    _documents = None
    _metadata = None
    _available = None  # Track whether heavy deps are importable

    def __new__(cls):
        """Singleton pattern — one shared instance across the app."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    @classmethod
    def _check_available(cls):
        """Check if FAISS and SentenceTransformers are importable."""
        if cls._available is not None:
            return cls._available
        try:
            import faiss  # noqa: F401
            import numpy  # noqa: F401
            from sentence_transformers import SentenceTransformer  # noqa: F401
            cls._available = True
        except ImportError:
            logger.warning("FAISS or SentenceTransformers not available. RAG disabled.")
            cls._available = False
        return cls._available

    def _ensure_loaded(self):
        """Lazy-load the embedding model and FAISS index."""
        if not self._check_available():
            return

        if self._model is None:
            from sentence_transformers import SentenceTransformer
            logger.info(f"Loading SentenceTransformer model: {settings.EMBEDDING_MODEL_NAME}")
            self._model = SentenceTransformer(settings.EMBEDDING_MODEL_NAME)
            logger.info("SentenceTransformer model loaded.")

        if self._index is None:
            self._load_index()

    def _load_index(self):
        """Load FAISS index and document metadata from disk."""
        import faiss

        index_path = Path(settings.FAISS_INDEX_DIR) / 'interview_prep.faiss'
        meta_path = Path(settings.FAISS_INDEX_DIR) / 'interview_prep_meta.pkl'

        if not index_path.exists():
            logger.warning(f"FAISS index not found at {index_path}. Run build_index.py first.")
            self._index = None
            self._documents = []
            self._metadata = []
            return

        logger.info(f"Loading FAISS index from {index_path}")
        self._index = faiss.read_index(str(index_path))

        with open(meta_path, 'rb') as f:
            data = pickle.load(f)
            self._documents = data['documents']
            self._metadata = data.get('metadata', [])

        logger.info(f"FAISS index loaded: {self._index.ntotal} vectors, {len(self._documents)} documents")

    def retrieve(self, query: str, top_k: int = 5) -> list[dict]:
        """
        Retrieve the most relevant document chunks for a query.

        Args:
            query: Search query string.
            top_k: Number of results to return.

        Returns:
            List of dicts with 'content', 'score', and 'source' keys.
        """
        if not self._check_available():
            logger.warning("RAG not available, returning empty results.")
            return []

        import numpy as np
        self._ensure_loaded()

        if self._index is None or self._index.ntotal == 0:
            logger.warning("FAISS index is empty or not loaded. Returning empty results.")
            return []

        # Encode query
        query_vector = self._model.encode([query]).astype(np.float32)

        # Search
        k = min(top_k, self._index.ntotal)
        distances, indices = self._index.search(query_vector, k)

        results = []
        for i, idx in enumerate(indices[0]):
            if idx == -1:
                continue
            result = {
                'content': self._documents[idx],
                'score': float(distances[0][i]),
            }
            if self._metadata and idx < len(self._metadata):
                result['source'] = self._metadata[idx].get('source', 'unknown')
                result['category'] = self._metadata[idx].get('category', 'general')
            results.append(result)

        logger.info(f"RAG retrieved {len(results)} documents for query: {query[:50]}...")
        return results

    @classmethod
    def build_index(cls, documents_dir: str = None):
        """
        Build a FAISS index from markdown documents on disk.

        This is called by the build_index management script.

        Args:
            documents_dir: Path to directory containing markdown files.
        """
        import numpy as np
        import faiss
        from sentence_transformers import SentenceTransformer

        documents_dir = documents_dir or str(settings.RAG_DOCUMENTS_DIR)
        index_dir = str(settings.FAISS_INDEX_DIR)
        os.makedirs(index_dir, exist_ok=True)

        model = SentenceTransformer(settings.EMBEDDING_MODEL_NAME)
        documents = []
        metadata = []

        # Walk through documents directory
        for root, _, files in os.walk(documents_dir):
            for file in files:
                if not file.endswith('.md'):
                    continue
                filepath = os.path.join(root, file)
                category = os.path.basename(root)

                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Simple chunking — split by double newlines, merge small chunks
                chunks = cls._chunk_document(content)
                for chunk in chunks:
                    documents.append(chunk)
                    metadata.append({
                        'source': file,
                        'category': category,
                    })

        if not documents:
            logger.warning(f"No documents found in {documents_dir}")
            return

        logger.info(f"Encoding {len(documents)} document chunks...")
        embeddings = model.encode(documents, show_progress_bar=True).astype(np.float32)

        # Build FAISS index (L2 distance)
        dimension = embeddings.shape[1]
        index = faiss.IndexFlatL2(dimension)
        index.add(embeddings)

        # Save index and metadata
        index_path = os.path.join(index_dir, 'interview_prep.faiss')
        meta_path = os.path.join(index_dir, 'interview_prep_meta.pkl')

        faiss.write_index(index, index_path)
        with open(meta_path, 'wb') as f:
            pickle.dump({'documents': documents, 'metadata': metadata}, f)

        logger.info(f"FAISS index built: {index.ntotal} vectors saved to {index_path}")

    @staticmethod
    def _chunk_document(text: str, max_chunk_size: int = 500) -> list[str]:
        """Split document into semantic chunks."""
        paragraphs = text.split('\n\n')
        chunks = []
        current_chunk = []
        current_size = 0

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue

            if current_size + len(para) > max_chunk_size and current_chunk:
                chunks.append('\n\n'.join(current_chunk))
                current_chunk = []
                current_size = 0

            current_chunk.append(para)
            current_size += len(para)

        if current_chunk:
            chunks.append('\n\n'.join(current_chunk))

        return chunks
