FROM python:3.10-slim

# Create a non-root user
RUN adduser --disabled-password --gecos "" studenthelper

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Switch to non-root user
USER studenthelper

# Expose the port your app uses
EXPOSE 8000

# Default command (adjust if using Flask)
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]