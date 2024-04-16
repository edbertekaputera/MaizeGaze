from itsdangerous import URLSafeTimedSerializer
from flask import current_app
from flask_mail import Message, Mail

# Initialize Mail
mail = Mail()

def generate_token_from_email(email):
    """Generates a token based on email"""
    serializer = URLSafeTimedSerializer(current_app.config["SECRET_KEY"])
    return serializer.dumps(email, salt=current_app.config["SECURITY_PASSWORD_SALT"])

def extract_email_from_token(token, expiration=3600):
    """Converts token to email"""
    serializer = URLSafeTimedSerializer(current_app.config.get("SECRET_KEY"))
    try:
        email = serializer.loads(
            token, 
            salt=current_app.config.get("SECURITY_PASSWORD_SALT"), 
            max_age=expiration
        )
        return email
    except Exception:
        return False

def send_email(to, subject, html=""):
    msg = Message(subject=subject, 
                  recipients=[to], 
                  html=html,
                  sender=("MaizeGaze", current_app.config.get("MAIL_DEFAULT_SENDER")))
    mail.send(msg)