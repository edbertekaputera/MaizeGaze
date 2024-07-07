# Libraries
from flask import session, Blueprint, request, current_app
from celery.result import AsyncResult
from base64 import encodebytes
from datetime import date 
# Local dependencies
from app.db import DiagnosisQuota
from app.authentication import permissions_required
from .diagnosis_task import diagnose_maize_health

# Initialize
router = Blueprint("diagnosis", __name__)
# All routes under farm would be  /api/chatbot/diagnosis/*

# Utility function
def allowed_file(filename:str):
	ALLOWED_EXTENSIONS = {'heic', 'png', 'jpg', 'jpeg'}
	return '.' in filename and \
		filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Initialize detection task route
@router.route("/init_diagnose", methods=["POST"])
@permissions_required(is_user=True, can_diagnose=True)
def init_diagnose() -> dict[str, bool|str]:
	# Get description
	description = request.form["description"]
    # Get uploaded file
	if "image" not in request.files:
		return {"success": False}
	file = request.files["image"]
	# Check file
	if not file or file.filename == "" or file.filename == None:
		return {"success": False}
	# Check file extension
	if not allowed_file(file.filename):
		return {"success": False}
	
	# Check user
	success = DiagnosisQuota.increment_quota(session['email'])
	if not success:
		return {"success": False}
	# Initialize task
	encoded = encodebytes(file.stream.read()).decode("ascii")	
	result = diagnose_maize_health.delay(encoded, description) # type: ignore
	return {"success": True, "result_id": result.id}

# Retrieve diagnosis task results route
@router.route("/get_diagnosis_result", methods=["GET"])
@permissions_required(is_user=True, can_diagnose=True)
def get_diagnosis_result() -> dict[str, str]:
	result_id = request.args["result_id"]
	result = AsyncResult(result_id)
	if result.ready():
		# Task has completed
		if result.successful():
			return {
				"status": "SUCCESS",
				"data": result.result
			}
		else:
		# Task completed with an error
			return {
				'status': 'ERROR', 
				'message': str(result.result)
			}
	else:
		# Task is still pending
		return {'status': 'RUNNING'}
	
# Retrieve diagnosis quota route
@router.route("/get_diagnosis_quota", methods=["GET"])
@permissions_required(is_user=True, can_diagnose=True)
def get_diagnosis_quota() -> dict[str, int]:
	today = date.today()
	dq = DiagnosisQuota.get(user_email=session['email'], month=today.month, year=today.year)
	if not dq:
		return {"quota": current_app.config["DIAGNOSIS_QUOTA_LIMIT"]}
	return {"quota":  current_app.config["DIAGNOSIS_QUOTA_LIMIT"] - dq.quota}