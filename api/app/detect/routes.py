# Libraries
from flask import session, Blueprint, request
from celery.result import AsyncResult
from base64 import encodebytes # type: ignore
# Local dependencies
from app.db import TypeOfUser, User
from app.authentication import roles_required
from .task import detect_and_count

# Initialize
router = Blueprint("detection", __name__)

# Utility function
def allowed_file(filename:str):
	ALLOWED_EXTENSIONS = {'heic', 'png', 'jpg', 'jpeg', 'gif'}
	return '.' in filename and \
		filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Initialize detection task route
@router.route("/init_detection", methods=["POST"])
# @roles_required(*TypeOfUser.all_users())
def init_detection():
    # Get uploaded file
	if "file" not in request.files:
		return {"success": False}
	file = request.files["file"]
	# Check file
	if not file or file.filename == "" or file.filename == None:
		return {"success": False}
	# Check file extension
	if not allowed_file(file.filename):
		return {"success": False}
	# Check user
	
	# Initialize task
	encoded = encodebytes(file.stream.read()).decode("ascii")	
	result = detect_and_count.delay(encoded) # type: ignore
	return {"success": True, "result_id": result.id}


# Retrieve detection task results route
@router.route("/get_detection_result", methods=["GET"])
# @roles_required(*TypeOfUser.all_users())
def get_detection_result():
	result_id = request.args.get("result_id")
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
