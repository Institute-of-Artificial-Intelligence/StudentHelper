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
EXPOSE 8888

# Default command (adjust if using Flask)
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8888", "server:app"]
