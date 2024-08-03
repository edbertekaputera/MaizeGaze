#!/bin/bash

# Activate service account if key file is present
if [ -f "/secrets/service-account-key.json" ]; then
    echo "Activating service account..."
    gcloud auth activate-service-account --key-file=/secrets/service-account-key.json
    export GOOGLE_APPLICATION_CREDENTIALS="/secrets/service-account-key.json"
else
    echo "No service account key found. Assuming we're using Vertex AI's default authentication."
fi

# Run the training script with all passed arguments
python train.py "$@"