# Libraries
from flask import Blueprint
# Local Dependencies
from .routes import router as main_router
from .farm_routes import router as farm_router
from .subscription_routes import router as subscription_router

# Initialize Blueprint
router = Blueprint("user", __name__)
router.register_blueprint(main_router, url_prefix="/")
router.register_blueprint(farm_router, url_prefix="/farm")
router.register_blueprint(subscription_router, url_prefix="/subscription")

__all__ = [
	"router" 
]