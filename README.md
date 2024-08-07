# MaizeGaze
Welcome to our Maize Tassel Detection and Counting Project.
## Collaborators:
1. [Edbert Ekaputera @edbertekaputera](https://github.com/edbertekaputera)
2. [Chrisyella Gracia @chrisyellagracia](https://github.com/chrisyellagracia)
3. [Moon Jiwon @jiwonyah](https://github.com/jiwonyah)
4. [Dai Rui Mei @daicc33](https://github.com/daicc33)
5. [Aung Ko Ko Oo @aungkokooo18](https://github.com/aungkokooo18)
## Installation/Setup guide:

### 1. Flask API Server
First, setup your python 3.10 environment. Ideally, use a virtual environment like `miniconda`.

Then, install the dependencies as followed,
```bash
# Move to the API directory
cd api
# Install libraries
pip install -r requirements.txt
```

Then, we need to setup a `.env` file in the `/api` directory. This `.env` file should follow the following format. (Please make sure to replace the ones with `quotation marks`)
```properties
# Flask Secret Key
SECRET_KEY = 'YOUR_SECRET_KEY'
SECURITY_PASSWORD_SALT = 'YOUR_SECRET_SALT'

# Admin credentials
ADMIN_EMAIL = admin@admin.com
ADMIN_PASSWORD = admin
ADMIN_NAME = Administrator

# Mail
EMAIL_USER = 'YOUR_EMAIL'
EMAIL_PASSWORD = 'YOUR_EMAIL_PASSWORD'
EMAIL_SERVER = 'YOUR_SMTP_SERVER'

# Client server
CLIENT_SERVER_URL = http://localhost:5173

# Database
DATABASE_URL = sqlite:///database.db

# Redis Session
REDIS_SESSION_URL = redis://localhost:6379/0
# Redis Broker
REDIS_BROKER_URL = redis://localhost:6379/1

# Google OAuth
GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID'
GOOGLE_CLIENT_SECRET = 'YOUR_GOOGLE_CLIENT_SECRET'
GOOGLE_REDIRECT_URI = http://localhost:5000/api/authentication/oauth/login/google/authorized

# Github OAuth
GITHUB_CLIENT_ID = 'YOUR_GITHUB_CLIENT_ID'
GITHUB_CLIENT_SECRET = 'YOUR_GITHUB_CLIENT_SECRET'
GITHUB_REDIRECT_URI = http://localhost:5000/api/authentication/oauth/login/github/authorized

# Reverse Geocode API (https://geocode.maps.co/)
REVERSE_GEOCODE_API = 'YOUR_API_KEY'

# Stripe
STRIPE_API_KEY = 'YOUR_API_KEY'
STRIPE_ENDPOINT_SECRET = 'YOUR_STRIPE_ENDPOINT_SECRET'

# Google
GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY'
GOOGLE_CLOUD_BUCKET_NAME = 'YOUR_GOOGLE_CLOUD_BUCKET_NAME'
GOOGLE_CLOUD_SERVICE_ACCOUNT_CREDENTIALS_PATH = "/PATH/TO/YOUR/SERVICE_ACCOUNT_CREDENTIALS.JSON"
GOOGLE_CLOUD_REGION = 'YOUR_CLOUD_REGION'
GOOGLE_CLOUD_PROJECT_ID = 'YOUR_GOOGLE_CLOUD_PROJECT'


# Vertex AI
VERTEX_TRAIN_CONTAINER_URI = 'YOUR_CUSTOM_TRAINING_CONTAINER_URI'
VERTEX_TRAIN_STAGING_BUCKET = 'YOUR_STAGING_BUCKET_PATH'
VERTEX_DETECT_ENDPOINT_ID='YOUR_VERTEX_AI_ONLINE_PREDICTIONS_ENDPOINT'
VERTEX_PROJECT_ID='YOUR_GOOGLE_CLOUD_PROJECT_ID'
```

To run the server, simply run `application.py` as followed, and it should be hosted locally at `port 5000`
```bash
# Start server
python application.py
```

### 2. React Web Server
First, install the dependencies as followed,
```bash
# Move to the client directory
cd client

# Install dependencies
npm install
```

To run the web server, simply run the following command, and it should be hosted locally at `port 5173`.
```bash
npm run dev
```

### 3. Redis Server (For session management)
First, make sure you have Docker. check out `https://www.docker.com/` if you don't.

Then, simply pull the image, create the container, and start it in one command as followed,
```bash
docker run -p 6379:6379 redis
```

This will run the redis server at `port 6379`, though you do not have to do this again. Simply use the following commands,
```bash
# To check currently running containers
docker ps

# To start a container
docker start <CONTAINER_NAME>

# To stop a container
docker stop <CONTAINER_NAME>
```

### 3. Celery Worker (For heavy tasks like model inference and training)
Since we already have `celery` installed within our python environment, we can just run the following command,
```bash
celery -A app worker --loglevel INFO -c <NUMBER_OF_WORKERS>
```
This will run `<NUMBER_OF_WORKERS>` workers, which can run concurrently to handle tasks in the `celery task queue system`.

### 4. Stripe CLI (for local testing)
We connected our system to the Stripe API, so if we want the server to run properly in local, we need `Stripe CLI` to forward all of the webhook calls to our local endpoint. So, first make sure you have installed and properly setup the `Stripe CLI`. Check out `https://docs.stripe.com/stripe-cli` if you haven't.

Then, authorize it to your Stripe Account by logging it as followed,
```bash
stripe login
```

Finally, you can forward all of events to your webhook with the following commands,
```bash
stripe listen --forward-to localhost:5000/api/user/subscription/stripe_webhook_endpoint
```

You can also simulate specific events for testing with the following commands,
```bash
stripe trigger payment_intent.succeeded
```

### 5. Docker Job Containers (For heavy tasks like model inference and training)
There are two docker containers located at `jobs/` which are `inference` and `training`.
Before you start, you have to build and push the containers to your cloud platform.
Here is an example on how you would do it for one of them,
```bash
# Go to the directory
cd jobs/inference
# Build the image
docker build --platform linux/amd64 -t <YOUR_CLOUD_CONTAINER_URI> .
# Push to cloud artifact repository
docker push <YOUR_CLOUD_CONTAINER_URI>
```

## Alternative Setup (Using Docker Compose)
First, make sure you have `Docker` installed and set up on your device. 
Check out `https://www.docker.com/` if you don't.

You can take advantage of the `Docker Compose` orchestration setup, to run all servers from step #1 to step #3. By simply running the following commands on the base directory.
```bash
# Build (For the building the first time)
docker compose build

# Start
docker compose start

# Stop
docker compose stop

# Check status
docker ps
```

## Important Note:
Make sure you have all three servers and the celery workers running at the same time, so that the system can work properly. For local development, make sure the Stripe CLI is also listening and forwarding events to your local endpoint.

If you want to add changes or contribute, please 
1. create your own `branch`
2. then start `developing and commiting on your own branch`.
3. push it, and create a `pull request` to merge it to `main`.

