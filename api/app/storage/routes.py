# Libraries
from flask import session, Blueprint, request, current_app
from base64 import encodebytes
from datetime import date 
import os
import json
from uuid import uuid4

# Local dependencies
from app.db import DetectionResult, TypeOfUser
from app.authentication import roles_required
from .utils import UserDirectory

# Initialize
router = Blueprint("storage", __name__)

# Utility function
def allowed_file(filename:str):
	ALLOWED_EXTENSIONS = {'heic', 'png', 'jpg', 'jpeg', 'gif'}
	return '.' in filename and \
		filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@router.route("/save", methods=["POST"])
@roles_required(*TypeOfUser.all_users(), TypeOfUser.ADMINISTRATOR)
def save() -> dict[str, bool]:
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
	
	# Initialize user directory
	user_directory_path = os.path.join(current_app.config["LOCAL_STORAGE_PATH"], session["email"])
	user_directory = UserDirectory(user_directory_path)

	# Generate ID
	id = str(uuid4())
	print(id)
	# Process annotations
	annotations = json.loads(request.form["annotations"])

	# Store in Bucket Storage
	success_storage = user_directory.save(id, file, annotations)
	if not success_storage:
		return {"success": False}
	
	# Store in DB
	data = {
		"id": id,
		"farm_name": request.form["farm_name"],
		"farm_user": session["email"],
		"tassel_count": request.form["tassel_count"],
		"record_date": date.today(),
		"name": request.form["name"],
		"description": request.form["description"]
	}
	success_db = DetectionResult.save(data)
	return {"success": success_db}