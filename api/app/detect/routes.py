# Libraries
from flask import session, Blueprint, request, current_app
from celery.result import AsyncResult
from datetime import date 
from base64 import encodebytes

# Local dependencies
from app.db import DetectionQuota
from app.authentication import permissions_required
from .task import detect_and_count

# Initialize
router = Blueprint("detection", __name__)
	
def allowed_file(filename:str):
	ALLOWED_EXTENSIONS = {'heic', 'png', 'jpg', 'jpeg'}
	return '.' in filename and \
		filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Initialize detection task route
@router.route("/init_detection", methods=["POST"])
@permissions_required(is_user=True)
def init_detection():
	# Get model_id (NULLABLE)
	model_id=request.form.get("model_id")
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
	success = DetectionQuota.increment_quota(session['email'], session["detection_quota_limit"])
	if not success:
		return {"success": False}
	
	# Initialize task
	b64_img = encodebytes(file.stream.read()).decode("ascii")	
	result = detect_and_count.delay(
		b64_img_bytes=b64_img,
		email=session["email"],
		project_id=current_app.config["VERTEX_PROJECT_ID"],
		endpoint_id=current_app.config["VERTEX_DETECT_ENDPOINT_ID"],
		location=current_app.config["GOOGLE_CLOUD_REGION"],
		google_cloud_credentials_path=current_app.config["GOOGLE_CLOUD_SERVICE_ACCOUNT_CREDENTIALS_PATH"],
		model_id=model_id
	) # type: ignore
	return {"success": True, "result_id": result.id}

# Retrieve detection task results route
@router.route("/get_detection_result", methods=["GET"])
@permissions_required(is_user=True)
def get_detection_result() -> dict[str, str]:
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

# Retrieve detection quota route
@router.route("/get_detection_quota", methods=["GET"])
@permissions_required(is_user=True)
def get_detection_quota() -> dict[str, int]:
	today = date.today()
	dq = DetectionQuota.get(user_email=session['email'], month=today.month, year=today.year)
	if not dq:
		return {"quota": session["detection_quota_limit"]}
	return {"quota":  session["detection_quota_limit"] - dq.quota}