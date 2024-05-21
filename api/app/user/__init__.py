# Libraries
from flask import Blueprint
# Local Dependencies
from .farm import router as farm_router

# Initialize Blueprint
router = Blueprint("user", __name__)
router.register_blueprint(farm_router, url_prefix="/farm")

__all__ = [
	"router" 
]