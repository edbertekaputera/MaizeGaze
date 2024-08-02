from .routes import router as main_router
from .models_routes import router as model_router
from flask import Blueprint

# Initialize Blueprint
router = Blueprint("detect", __name__)
router.register_blueprint(main_router, url_prefix="/")
router.register_blueprint(model_router, url_prefix="/models")

__all__ = [
	"router"
]