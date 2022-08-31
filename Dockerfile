FROM python:3.8.10-slim

ENV TZ Asia/Shanghai

WORKDIR /app

COPY requirements.txt .

RUN pip install \
    -r requirements.txt \
    --no-cache-dir \
    --quiet \
    -i https://mirrors.aliyun.com/pypi/simple

COPY . .

CMD ["python", "main.py"]