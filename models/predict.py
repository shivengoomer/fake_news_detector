import pandas as pd
import torch
from typing import Dict
from config.settings import settings
from models.load_models import model_context

def predict(text: str, df: pd.DataFrame) -> Dict:
    with model_context() as models:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        # BERT Prediction
        encoding = models.bert_tokenizer(
            text, 
            truncation=True, 
            padding=True, 
            max_length=512, 
            return_tensors="pt"
        ).to(device)
        
        with torch.no_grad():
            logits = models.bert_model(**encoding).logits
        bert_pred = torch.argmax(logits, dim=1).item()
        
        # FAISS Similarity Search
        query_embedding = models.sentence_model.encode([text])
        D, I = models.faiss_index.search(query_embedding, k=3)
        original_indices = models.train_indices[I[0]]
        results = df.loc[original_indices].to_dict(orient="records")
        
        # LLM Verification
        query_engine = models.index.as_query_engine()
        llm_response = query_engine.query(f"Analyze this news authenticity: {text}")
        
        return {
            "bert_prediction": "Real" if bert_pred == 1 else "Fake",
            "similar_articles": results,
            "llm_analysis": str(llm_response),
            "processed_at": pd.Timestamp.now()
        }