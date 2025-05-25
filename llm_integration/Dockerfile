FROM python:3.11.9-slim

# Установим зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем код
COPY . /app
WORKDIR /app

# Открываем порт (если будешь проксировать Nginx-ом — это пригодится)
EXPOSE 8888

# Запускаем через Gunicorn — production-ready сервер
CMD ["gunicorn", "--bind", "0.0.0.0:8888", "llm_integration.server:app"]