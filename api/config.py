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
	SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
	SQLALCHEMY_TRACK_MODIFICATIONS = False

	# Session configurations
	SESSION_TYPE = 'redis'
	SESSION_PERMANENT = False
	SESSION_USE_SIGNER = True
	PERMANENT_SESSION_LIFETIME = 3600
	SESSION_REDIS = redis.from_url(os.environ.get('REDIS_SESSION_URL'))
	
	# Celery
	# CELERY_BROKER_URL = os.environ.get('REDIS_BROKER_URL')
	# CELERY_RESULT_BACKEND = os.environ.get('REDIS_BROKER_URL')
	# CELERY_TASK_IGNORE_RESULT = True
	# CELERY_ACCEPT_CONTENT = ['json']
	# CELERY_TASK_SERIALIZER = 'json'
	# CELERY_RESULT_SERIALIZER = 'json'
	CELERY = dict(
            broker_url= os.environ.get('REDIS_BROKER_URL'),
            result_backend= os.environ.get('REDIS_BROKER_URL'),
            task_ignore_result=True,
	)

	# Bucket Storage
	USE_LOCAL_STORAGE = (os.environ.get("CLOUD_BUCKET_URL") == None)
	LOCAL_STORAGE_PATH = os.path.join(basedir, "local_storage")

	# Mail configurations
	MAIL_DEFAULT_SENDER = os.environ.get('EMAIL_USER')
	MAIL_SERVER = "smtp-mail.outlook.com"
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