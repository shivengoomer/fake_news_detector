import pandas as pd
import numpy as np
import faiss
from sklearn.model_selection import train_test_split
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    Trainer,
    TrainingArguments,
)
from sentence_transformers import SentenceTransformer
from llama_index import GPTVectorStoreIndex, SimpleDirectoryReader, ServiceContext
from llama_index.llms import HuggingFaceLLM
from config.settings import settings

def train_and_save():
    # Load and prepare data
    df = pd.read_csv(settings.DATASET_PATH)
    df['label'] = df['label'].map({'real': 1, 'fake': 0})
    
    # Split data
    train_texts, test_texts, train_labels, test_labels = train_test_split(
        df['text'], df['label'], test_size=0.2, random_state=42
    )
    train_indices = train_texts.index.tolist()
    
    # Train BERT model
    tokenizer = AutoTokenizer.from_pretrained(settings.BERT_MODEL_NAME)
    model = AutoModelForSequenceClassification.from_pretrained(
        settings.BERT_MODEL_NAME, num_labels=2
    )
    
    # Training setup
    training_args = TrainingArguments(
        output_dir=settings.MODEL_DIR / "bert_fake_news",
        evaluation_strategy="epoch",
        per_device_train_batch_size=8,
        per_device_eval_batch_size=8,
        save_steps=10_000,
        save_total_limit=2
    )
    
    # Create datasets and train
    train_dataset = ...  # Same as original dataset creation
    test_dataset = ...   # Same as original dataset creation
    
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=test_dataset,
    )
    trainer.train()
    trainer.save_model()
    
    # Create and save FAISS index
    sentence_model = SentenceTransformer(settings.SENTENCE_MODEL_NAME)
    embeddings = sentence_model.encode(train_texts.tolist())
    index = faiss.IndexFlatL2(embeddings.shape[1])
    index.add(embeddings)
    
    settings.INDEX_DIR.mkdir(exist_ok=True)
    faiss.write_index(index, str(settings.FAISS_INDEX_PATH))
    np.save(settings.TRAIN_INDICES_PATH, np.array(train_indices))
    
    # Create and save LlamaIndex
    llm = HuggingFaceLLM(model_name=settings.LLM_MODEL_NAME)
    service_context = ServiceContext.from_defaults(llm=llm)
    documents = SimpleDirectoryReader(input_files=[str(settings.DATASET_PATH)]).load_data()
    index = GPTVectorStoreIndex.from_documents(documents, service_context=service_context)
    index.storage_context.persist(persist_dir=settings.LLAMA_INDEX_DIR)