FROM python:3.8.10-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple/

CMD ["python", "main.py"]