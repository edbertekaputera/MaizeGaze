# Start with a base Python image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Install necessary packages
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \ 
	ffmpeg libsm6 libxext6 \
    && rm -rf /var/lib/apt/lists/*

# Install Google Cloud SDK
RUN echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | tee -a /etc/apt/sources.list.d/google-cloud-sdk.list \
    && curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key --keyring /usr/share/keyrings/cloud.google.gpg add - \
    && apt-get update && apt-get install -y google-cloud-sdk \
    && rm -rf /var/lib/apt/lists/*

# Copy the training script and any other necessary files
COPY . /app

# Install Python Dependencies
RUN pip install --no-cache-dir -r ./requirements.txt

# Set environment variables
ENV MODEL_DIR=/app/model

# Create necessary directories
RUN mkdir -p $MODEL_DIR

# Set up a directory for the service account key
RUN mkdir -p /secrets

# Set up a directory for the data
RUN mkdir -p /data
RUN mkdir -p /data/images
RUN mkdir -p /data/labels

# Set the entrypoint to a shell script that will handle authentication and then run the training script
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]



