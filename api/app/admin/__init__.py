# Libraries
from flask import Blueprint
# Local Dependencies
from .user_management_routes import router as user_management_router
# from .routes import router as main_router

# Initialize Blueprint
router = Blueprint("admin", __name__)
router.register_blueprint(user_management_router, url_prefix="/user_management")
# router.register_blueprint(main_router, url_prefix="/")

__all__ = [
	"router" 
]