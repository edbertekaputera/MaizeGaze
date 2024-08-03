# Libraries
from flask import Blueprint
# Local Dependencies
from .utils import GeminiModel
from .diagnosis_routes import router as diagnosis_router
from .consultation_routes import router as consultation_router

# Initialize Blueprint
router = Blueprint("chatbot", __name__)
router.register_blueprint(diagnosis_router, url_prefix="/diagnosis")
router.register_blueprint(consultation_router, url_prefix="/consultation")

__all__ = [
	"router", "GeminiModel"
]