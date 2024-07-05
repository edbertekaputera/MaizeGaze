# Libraries
from flask import session, Blueprint, request, send_file, Response, abort
from datetime import datetime
import json
from uuid import uuid4

# Local dependencies
from app.db import DetectionResult
from app.authentication import permissions_required
from .utils import UserDirectory

# Initialize
router = Blueprint("storage", __name__)

# Utility function
def allowed_file(filename:str):
	ALLOWED_EXTENSIONS = {'heic', 'png', 'jpg', 'jpeg', 'gif'}
	return '.' in filename and \
		filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@router.route("/save", methods=["POST"])
@permissions_required(is_user=True)
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
	user_directory = UserDirectory()

	# Generate ID
	id = str(uuid4())
	# Process annotations
	annotations = json.loads(request.form["annotations"])

	# Store in Bucket Storage
	success_storage = user_directory.save(request.form["farm_name"], id, file, annotations)
	if not success_storage:
		return {"success": False}
	
	# Store in DB
	data = {
		"id": id,
		"farm_name": request.form["farm_name"],
		"farm_user": session["email"],
		"tassel_count": request.form["tassel_count"],
		"record_date": datetime.now(),
		"name": request.form["name"],
		"description": request.form["description"]
	}
	success_db = DetectionResult.save(data)
	return {"success": success_db}

@router.route("/query_result", methods=["GET"])
@permissions_required(is_user=True)
def queryResult() -> dict[str, int | str | dict[str, str | int | list[dict[str,float]]]]:
	farm = request.args["farm_name"]
	id = request.args["id"]
	result = DetectionResult.queryResult(session["email"], farm, id)
	if not result:
		return {"status_code": 404, "message": "Detection Results not found."}
	
	# Retrieve Image, Annotations, and Annotated Images
	user_directory = UserDirectory()
	resources = user_directory.retrieveResource(result)
	
	# Add metadata info
	result_json = {
		"id": result.id,
		"tassel_count": int(result.tassel_count),
		"record_date": result.record_date.strftime("%Y-%m-%d %H:%M:%S"),
		"name": result.name,
		"description": result.description,
		"farm_name": result.farm_name,
		"farm_user": result.farm_user,
		"original_image": resources["original_image"],
		"annotated_image": resources["annotated_image"],
		"annotations": resources["annotations"]
	}
	return {"status_code": 200, "result": result_json}

@router.route("/delete_results", methods=["DELETE"])
@permissions_required(is_user=True)
def deleteResults() -> dict[str, bool]:
	json = request.get_json()
	list_of_results = []
	for result in json["results_pk"]:
		list_of_results.append({
			"id": result["id"],
			"farm_name": result["farm_name"],
			"farm_user": session["email"]
		})
	
	# Delete records in DB
	results = DetectionResult.deleteSelectedResults(list_of_results)

	# Initialize user directory
	user_directory = UserDirectory()
  
	success_flag = True
	for r in results:
		if not user_directory.delete(r):
			success_flag = False

	return {"success": (len(results) == len(list_of_results) and success_flag)}

@router.route("/download_results", methods=["POST"])
@permissions_required(is_user=True)
def downloadResult() -> Response:
	result_pk = request.get_json()["results_pk"]
	list_of_results = []
	for result in result_pk:
		list_of_results.append({
			"id": result["id"],
			"farm_name": result["farm_name"],
			"farm_user": session["email"]
		})
	# Check if exist
	results = DetectionResult.querySelectedResults(list_of_results)
	if len(results) != len(list_of_results):
		abort(404)

	# Initialize user directory
	user_directory = UserDirectory()
	zip_buffer = user_directory.downloadZipped(results)
	zip_buffer.seek(0)
	# Send file
	return send_file(
		zip_buffer,
		mimetype="application/zip",
		as_attachment=True,
		download_name="results.zip"
	)

@router.route("/search_result_history", methods=["GET"])
@permissions_required(is_user=True)
def searchResultHistory() -> dict[str, list[dict[str, str|int]]]:
	results = DetectionResult.queryAllResultHistory(session["email"])
	resultList = []
	for result in results:
		result_json = {
		"id": result.id,
		"tassel_count": int(result.tassel_count),
		"record_date": result.record_date.strftime("%Y-%m-%d %H:%M:%S"),
		"name": result.name,
		"description": result.description,
		"farm_name": result.farm_name,
		"farm_user": result.farm_user
		}

		resultList.append(result_json)

	return {"result": resultList}

@router.route("/get_storage_size", methods=["GET"])
@permissions_required(is_user=True)
def get_storage_size() -> dict[str, float | int]:
	user_directory = UserDirectory()
	used_storage_size = user_directory.get_size()
	return {"status_code": 200, "storage_size" : used_storage_size}

@router.route("/query_daily_statistics", methods=["GET"])
@permissions_required(is_user=True)
def queryDailyStatistics() -> dict[str, list[dict[str, str|int]]]:
	results = DetectionResult.queryDailyStatistics(session["email"])
	resultList = []
	for result in results:
		print(result)
		result_json = {
		"tassel_count": int(result.total_tassel_count),
		"record_date": result.record_date,
		"farm_name": result.farm_name,
		}
		resultList.append(result_json)

	return {"result": resultList}

@router.route("/reannotate_result", methods=["POST"])
@permissions_required(is_user=True)
def reannotateResult() -> dict[str, int | str]:
	# Get Updated Result
	data = request.get_json()
	if not data or "updated_result" not in data:
        	return {"status_code": 400, "message": "Invalid input data."}
		
	updated_result = data["updated_result"]
	
	# Update Tassel Count
	success_update = DetectionResult.update(updated_result["farm_user"], updated_result["farm_name"], updated_result["id"], updated_result["tassel_count"])
	if not success_update:
		return {"status_code": 400, "message": "Failed to update tassel count."}

	# Update Annotation
	detection_result = DetectionResult.queryResult(updated_result["farm_user"], updated_result["farm_name"], updated_result["id"])
	
	user_directory = UserDirectory()
	success_replace = user_directory.replace(detection_result, updated_result["annotations"])
	if not success_replace:
		return {"status_code": 400, "message": "Failed to replace annotations."}
	
	return {"status_code": 200, "message": "Reannotation Successful."}
