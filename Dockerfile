FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /app/data /app/input_stream /app/output_stream /app/indexes

VOLUME ["/app/data", "/app/input_stream", "/app/output_stream"]

CMD ["python", "main.py"]