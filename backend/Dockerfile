FROM python:3.13-slim

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies (e.g. build tools for some packages if needed)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . /app/

# Run migrations and collect static files for production
RUN python manage.py collectstatic --noinput || true

EXPOSE 8000

# 1 worker (free tier = 512MB), long timeout for AI pipeline,
# preload app to share memory, bind immediately so Render detects the port
# Run migrations before starting gunicorn to ensure the SQLite DB is initialized
CMD ["sh", "-c", "python manage.py migrate && gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 1 --timeout 300 --preload"]
