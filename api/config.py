import os 
import redis
from dotenv import load_dotenv

# Load Environment variables
basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))

# Config class
class Config(object):
	SECRET_KEY = os.environ.get('SECRET_KEY') or 'default-flask-key'
	SECURITY_PASSWORD_SALT = os.environ.get("SECURITY_PASSWORD_SALT") or "very-important"
	FLASK_APP = os.environ.get('FLASK_APP') or 'application.py'	
	# Client URL
	CLIENT_SERVER_URL = os.environ.get('CLIENT_SERVER_URL')

	# Database configurations
	if os.environ.get("POSTGRES_HOST"):
		POSTGRES_USER = os.environ.get('POSTGRES_USER')
		POSTGRES_PASSWORD = os.environ.get('POSTGRES_PASSSWORD')
		POSTGRES_PORT = os.environ.get('POSTGRES_PORT')
		POSTGRES_DB_SCHEMA = os.environ.get('POSTGRES_DB_SCHEMA')
		POSTGRES_HOST = os.environ.get('POSTGRES_HOST')
		SQLALCHEMY_DATABASE_URI = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB_SCHEMA}"
	else:
		SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
	SQLALCHEMY_TRACK_MODIFICATIONS = False

	# Session configurations
	SESSION_TYPE = 'redis'
	SESSION_PERMANENT = False
	SESSION_USE_SIGNER = True
	PERMANENT_SESSION_LIFETIME = 3600
	SESSION_REDIS = redis.from_url(os.environ.get('REDIS_SESSION_URL'))
	
	# Celery
	CELERY = dict(
            broker_url= os.environ.get('REDIS_BROKER_URL'),
            result_backend= os.environ.get('REDIS_BROKER_URL'),
            task_ignore_result=True,
	)

	# Mail configurations
	MAIL_DEFAULT_SENDER = os.environ.get('EMAIL_USER')
	MAIL_SERVER = os.environ.get('EMAIL_SERVER')
	MAIL_PORT = 587
	MAIL_USE_TLS = True
	MAIL_USE_SSL = False
	MAIL_DEBUG = False
	MAIL_USERNAME = os.environ.get("EMAIL_USER")
	MAIL_PASSWORD = os.environ.get("EMAIL_PASSWORD")

 	# Google OAuth 2.0 configurations:
    # https://developers.google.com/identity/protocols/oauth2/web-server#httprest
	GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
	GOOGLE_CLIENT_SECRET =  os.environ.get('GOOGLE_CLIENT_SECRET')
	GOOGLE_REDIRECT_URI = os.environ.get('GOOGLE_REDIRECT_URI')

	# GitHub OAuth 2.0 configurations:
    # https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps
	GITHUB_CLIENT_ID = os.environ.get('GITHUB_CLIENT_ID')
	GITHUB_CLIENT_SECRET =  os.environ.get('GITHUB_CLIENT_SECRET')
	GITHUB_REDIRECT_URI = os.environ.get('GITHUB_REDIRECT_URI')

	# Geocoding API
	REVERSE_GEOCODE_API = os.environ.get('REVERSE_GEOCODE_API')

	# Stripe
	STRIPE_API_KEY = os.environ["STRIPE_API_KEY"]
	STRIPE_ENDPOINT_SECRET = os.environ["STRIPE_ENDPOINT_SECRET"]

	# Google Cloud 
	GOOGLE_CLOUD_REGION = os.environ["GOOGLE_CLOUD_REGION"]
	GOOGLE_CLOUD_PROJECT_ID = os.environ["GOOGLE_CLOUD_PROJECT_ID"]

	# GOOGLE CREDENTIALS SERVICE ACCOUNT
	GOOGLE_CLOUD_SERVICE_ACCOUNT_CREDENTIALS_PATH = os.environ.get("GOOGLE_CLOUD_SERVICE_ACCOUNT_CREDENTIALS_PATH")
	GOOGLE_CLOUD_SERVICE_SCOPE = ['https://www.googleapis.com/auth/cloud-platform']

	# Bucket Storage
	USE_LOCAL_STORAGE = (os.environ.get("GOOGLE_CLOUD_BUCKET_NAME") == None)
	GOOGLE_CLOUD_BUCKET_NAME = os.environ.get("GOOGLE_CLOUD_BUCKET_NAME")
	LOCAL_STORAGE_PATH = os.path.join(basedir, "local_storage")

	# GEMINI Text Generation
	GEMINI_API_KEY = os.environ["GEMINI_API_KEY"]
	DIAGNOSIS_QUOTA_LIMIT = 25
	CONSULTATION_QUOTA_LIMIT = 25

	# Vertex AI
	VERTEX_TRAIN_CONTAINER_URI = os.environ["VERTEX_TRAIN_CONTAINER_URI"]
	VERTEX_TRAIN_STAGING_BUCKET = os.environ["VERTEX_TRAIN_STAGING_BUCKET"]
	VERTEX_DETECT_ENDPOINT_ID = os.environ["VERTEX_DETECT_ENDPOINT_ID"]
	VERTEX_PROJECT_ID = os.environ["VERTEX_PROJECT_ID"]