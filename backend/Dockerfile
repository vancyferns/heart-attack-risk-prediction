FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=7860

# Install system dependencies required by OpenCV and GUI-related libs
RUN apt-get update \
	 && apt-get install -y --no-install-recommends \
		 libglib2.0-0 \
		 libsm6 \
		 libxrender1 \
		 libxext6 \
		 libx11-6 \
		 libxcb1 \
		libgl1 \
		libgl1-mesa-dri \
	&& rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app

EXPOSE 7860

CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT} wsgi:app"]