# Libraries
from flask import Blueprint
# Local Dependencies
from .farm_routes import router as farm_router
from .routes import router as main_router

# Initialize Blueprint
router = Blueprint("user", __name__)
router.register_blueprint(farm_router, url_prefix="/farm")
router.register_blueprint(main_router, url_prefix="/")

__all__ = [
	"router" 
]