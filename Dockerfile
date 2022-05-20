FROM python:3.8.10-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install -r requirements.txt \
    && rm -rf ~/.cache/pip

COPY . .

CMD ["python", "main.py"]