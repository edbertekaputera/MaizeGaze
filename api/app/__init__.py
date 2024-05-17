# Libraries
import os
from flask import Flask
from flask_session import Session
from flask_cors import CORS
from config import Config
from celery import Celery, Task
from sqlalchemy import event
# Local dependencies
from app.db import db, User, TypeOfUser
from app.authentication import oauth, bcrypt, mail, router as auth_router
from app.detect import router as detect_router
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

# Celery
def celery_init_app(app: Flask) -> Celery:
    class FlaskTask(Task):
        def __call__(self, *args: object, **kwargs: object) -> object:
            with app.app_context():
                return self.run(*args, **kwargs)

    celery_app = Celery(app.name, task_cls=FlaskTask)
    celery_app.config_from_object(app.config["CELERY"])
    celery_app.set_default()
    app.extensions["celery"] = celery_app
    return celery_app

celery = celery_init_app(flask_app)

# Database
def _fk_pragma_on_connect(dbapi_con, con_record):
    dbapi_con.execute('pragma foreign_keys=ON')
    
db.init_app(flask_app)
with flask_app.app_context():
	db.create_all()
	# Enforce Foreign Key contraint on SQLite
	if 'sqlite' in flask_app.config['SQLALCHEMY_DATABASE_URI']:
		event.listen(db.engine, 'connect', _fk_pragma_on_connect)
            
	# Initialize admin
	if not User.get(os.environ["ADMIN_EMAIL"]):
		admin = User(
			email=os.environ.get("ADMIN_EMAIL"),
			name=os.environ.get("ADMIN_NAME"),
			user_type=TypeOfUser.ADMINISTRATOR,
			password=bcrypt.generate_password_hash(os.environ.get("ADMIN_PASSWORD")),
			email_is_verified=True
		) # type: ignore
		db.session.add(admin)
		db.session.commit()

# Routes (make sure everything starts with /api to prevent collision with web routes)
flask_app.register_blueprint(auth_router, url_prefix="/api/authentication")
flask_app.register_blueprint(detect_router, url_prefix="/api/detect")
flask_app.register_blueprint(main_router, url_prefix="/api")