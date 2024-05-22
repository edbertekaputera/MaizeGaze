# Libraries
from flask import Blueprint
# Local Dependencies
from .authentication import bcrypt, router as authentication_router
from .oauth import oauth, router as oauth_router
from .email import extract_email_from_token, generate_token_from_email, send_email, mail
from .utils import login_required, permissions_required

# Initialize Blueprint
router = Blueprint("authentication", __name__)
router.register_blueprint(oauth_router, url_prefix="/oauth")
router.register_blueprint(authentication_router, url_prefix="/")

__all__ = [
	"router", "bcrypt", "mail", "oauth",
	'extract_email_from_token', 'generate_token_from_email', 'send_email', 
	"login_required", "permissions_required"
]