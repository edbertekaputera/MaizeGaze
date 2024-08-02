from .sqlalchemy import db
from .user import User
from .user_type import TypeOfUser
from .detection_quota import DetectionQuota
from .farm import Farm
from .detection_result import DetectionResult
from .suspension import Suspension
from .diagnosis_quota import DiagnosisQuota
from .consultation_quota import ConsultationQuota
from .crop_patch import CropPatch
from .feedback import Feedback
__all__ = [
	"db", "User", "TypeOfUser", "Farm", "DetectionResult", "Suspension",
	"DiagnosisQuota", "DetectionQuota", "ConsultationQuota", "CropPatch", "Feedback"
]