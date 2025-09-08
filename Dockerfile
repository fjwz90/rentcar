# Python 3.12 slim 이미지 사용
FROM python:3.12-slim

# 작업 디렉토리 생성
WORKDIR /app

# OS 패키지 업데이트 및 psycopg2, Pillow 빌드에 필요한 lib 설치
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 종속성 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 앱 소스 복사
COPY . .

# Gunicorn을 기본 실행기로 설정 (app.py 안에 Flask 인스턴스 이름이 app 이라고 가정)
CMD ["gunicorn", "-b", "0.0.0.0:5000", "app:app"]
