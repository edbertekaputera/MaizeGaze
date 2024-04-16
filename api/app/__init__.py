# Libraries
import os
from flask import Flask
from flask_session import Session
from flask_cors import CORS
from flask_mail import Mail
from config import Config
# Local dependencies
from app.db import db, User, TypeOfUser
from app.authentication import oauth, bcrypt, mail, router as auth_router
from app.routes import router as main_router

# Initialize Flask App
flask_app = Flask(__name__)
flask_app.config.from_object(Config)

# Server-side session
server_session = Session(flask_app)
# CORS
cors = CORS(flask_app)
# Mail
mail.init_app(flask_app)
# OAuth
oauth.init_app(flask_app)
# Encryption
bcrypt.init_app(flask_app)

# Database
db.init_app(flask_app)
with flask_app.app_context():
	db.create_all()
	# Initialize admin
	if not User.get(os.environ.get("ADMIN_EMAIL")):
		admin = User(
			email=os.environ.get("ADMIN_EMAIL"),
			name=os.environ.get("ADMIN_NAME"),
			user_type=TypeOfUser.ADMINISTRATOR,
			password=bcrypt.generate_password_hash(os.environ.get("ADMIN_PASSWORD")),
			email_is_verified=True
		)
		db.session.add(admin)
		db.session.commit()

# Routes (make sure everything starts with /api to prevent collision with web routes)
flask_app.register_blueprint(auth_router, url_prefix="/api/authentication")
flask_app.register_blueprint(main_router, url_prefix="/api")