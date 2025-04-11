from contextlib import contextmanager
import faiss
import numpy as np
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from sentence_transformers import SentenceTransformer
from config.settings import settings

@contextmanager
def model_context():
    class ModelContainer:
        def __init__(self):
            # Load BERT components
            self.bert_tokenizer = AutoTokenizer.from_pretrained(settings.BERT_MODEL_NAME)
            self.bert_model = AutoModelForSequenceClassification.from_pretrained(
                settings.MODEL_DIR / "bert_fake_news"
            )
            self.bert_model.eval()
            
            # Load Sentence Transformer
            self.sentence_model = SentenceTransformer(settings.SENTENCE_MODEL_NAME)
            
            # Load FAISS Index
            self.faiss_index = faiss.read_index(settings.FAISS_INDEX_PATH)
            self.train_indices = np.load(settings.TRAIN_INDICES_PATH)
            
            # Custom FAISS-based vector index
            self.vector_dim = self.faiss_index.d  # Dimension of the vectors in the FAISS index
            self.vector_index = faiss.IndexFlatL2(self.vector_dim)  # L2 distance for similarity search

        def add_to_index(self, embeddings):
            """
            Add embeddings to the FAISS index.
            """
            self.vector_index.add(embeddings)

        def search_index(self, query_embedding, k=5):
            """
            Search the FAISS index for the top-k most similar vectors.
            """
            distances, indices = self.vector_index.search(query_embedding, k)
            return distances, indices

    yield ModelContainer()