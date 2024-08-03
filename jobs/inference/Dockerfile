# Use an official Python runtime as a parent image
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

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Set environment variables
ENV MODEL_DIR=/app/model

# Set up a directory for the service account key
RUN mkdir -p /secrets

# ONLY FOR TESTING LOCALLY
# RUN cp /app/keys/service-account-key.json /secrets/service-account-key.json
# ENV BUCKET_NAME=maizegaze_fyp_24_s2_10_bucket_storage

# Make port 8080 available to the world outside this container
EXPOSE 8080
RUN chmod +x entrypoint.sh

# Run app.py when the container launches
ENTRYPOINT ["/app/entrypoint.sh"]