from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings:
    # Data paths
    DATA_DIR = BASE_DIR / "data"
    MODEL_DIR = BASE_DIR / "models"
    INDEX_DIR = BASE_DIR / "indexes"
    
    # File paths
    DATASET_PATH = DATA_DIR / "cleaned_news_dataset.csv"
    FAISS_INDEX_PATH = INDEX_DIR / "news_faiss_index.bin"
    TRAIN_INDICES_PATH = INDEX_DIR / "train_indices.npy"
    LLAMA_INDEX_DIR = INDEX_DIR / "llama_index_dir"
    
    # Model names
    BERT_MODEL_NAME = "bert-base-uncased"
    SENTENCE_MODEL_NAME = "all-MiniLM-L6-v2"
    LLM_MODEL_NAME = "gpt2"
    
    # Pathway settings
    INPUT_STREAM = BASE_DIR / "input_stream"
    OUTPUT_STREAM = BASE_DIR / "output_stream"

settings = Settings()