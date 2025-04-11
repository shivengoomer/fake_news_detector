import pathway as pw
import pandas as pd
from config.settings import settings
from models.load_models import model_context
from models.predict import predict

class InputSchema(pw.Schema):
    text: str
    metadata: dict = pw.column_definition(default={})

def process_stream():
    # Load reference dataset
    df = pd.read_csv(settings.DATASET_PATH)
    df['label'] = df['label'].map({1: 'Real', 0: 'Fake'})
    
    # Define input stream
    input_data = pw.io.jsonlines.read(
        settings.INPUT_STREAM,
        schema=InputSchema,
        mode="streaming"
    )
    
    # Processing function
    def processing_fn(row: pw.Row, models) -> pw.Row:
        result = predict(row.text, df)
        return pw.Row(
            original_text=row.text,
            prediction=result["bert_prediction"],
            llm_analysis=result["llm_analysis"],
            similar_articles=str(result["similar_articles"]),
            timestamp=result["processed_at"]
        )
    
    # Process data with model context
    processed = input_data.contextualize(processing_fn).with_context(models=model_context)
    
    # Write output
    pw.io.jsonlines.write(
        processed,
        settings.OUTPUT_STREAM,
        ndjson=True
    )
    
    return processed

if __name__ == "__main__":
    process_stream()
    pw.run()