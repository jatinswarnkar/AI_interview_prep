FROM python:3.13-slim

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install ONLY lightweight production dependencies (no PyTorch/FAISS)
COPY requirements.prod.txt /app/
RUN pip install --no-cache-dir -r requirements.prod.txt

# Copy project files
COPY . /app/

# Collect static files for WhiteNoise
RUN python manage.py collectstatic --noinput || true

EXPOSE 8000

# 1 worker, long timeout for AI pipeline, run migrations on startup
CMD ["sh", "-c", "python manage.py migrate && gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 1 --timeout 300"]
