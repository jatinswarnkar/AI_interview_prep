#!/usr/bin/env python
"""
Build the FAISS vector index from seed documents.

Usage:
    cd backend
    python rag/build_index.py

This script:
1. Reads all markdown files from rag/documents/
2. Chunks them into semantically meaningful segments
3. Encodes chunks using SentenceTransformers
4. Builds a FAISS index (IndexFlatL2)
5. Saves the index and metadata to rag/index/
"""
import os
import sys
from pathlib import Path

# Add backend to Python path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

# Setup Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')

import django
django.setup()

from services.rag_service import RAGService


def main():
    print("=" * 60)
    print("Building FAISS Vector Index")
    print("=" * 60)

    documents_dir = backend_dir / 'rag' / 'documents'
    print(f"\nSource documents: {documents_dir}")

    # List documents
    md_files = list(documents_dir.rglob('*.md'))
    print(f"Found {len(md_files)} markdown files:")
    for f in md_files:
        print(f"  - {f.relative_to(documents_dir)}")

    # Build index
    print("\nBuilding FAISS index...")
    RAGService.build_index(str(documents_dir))

    # Verify
    index_dir = backend_dir / 'rag' / 'index'
    faiss_file = index_dir / 'interview_prep.faiss'
    meta_file = index_dir / 'interview_prep_meta.pkl'

    if faiss_file.exists() and meta_file.exists():
        print(f"\n✅ Index built successfully!")
        print(f"   FAISS index: {faiss_file} ({faiss_file.stat().st_size / 1024:.1f} KB)")
        print(f"   Metadata: {meta_file} ({meta_file.stat().st_size / 1024:.1f} KB)")

        # Test retrieval
        print("\n--- Test Retrieval ---")
        rag = RAGService()
        # Reset singleton to force reload
        RAGService._index = None
        RAGService._documents = None
        RAGService._metadata = None

        results = rag.retrieve("system design scalability", top_k=3)
        for i, r in enumerate(results):
            print(f"\nResult {i+1} (score: {r['score']:.4f}, source: {r.get('source', 'unknown')}):")
            print(f"  {r['content'][:150]}...")
    else:
        print("\n❌ Index build failed!")
        sys.exit(1)

    print("\n" + "=" * 60)
    print("Done!")


if __name__ == '__main__':
    main()
