# Libraries
from flask import session, Blueprint, request, current_app
from celery.result import AsyncResult
from celery.states import READY_STATES
from datetime import datetime
from uuid import uuid4

# Local dependencies
from app.db import DetectionResult, DetectionModel
from app.authentication import permissions_required
from .task import train_model
from app.storage import UserDirectory

# Initialize
router = Blueprint("models", __name__)

# Initialize Training task route
@router.route("/init_train", methods=["POST"])
@permissions_required(is_user=True)
def init_train() -> dict[str, bool|str]:
	json = request.get_json()
	list_of_data = json["list_of_data"]
	model_name = json["name"]
	base_model_id = json.get("base_model_id") # Can be null => default model
	new_model_id = str(uuid4())
	# Check if sufficient data
	if len(list_of_data) < 5:
		return {"success": False, "message": "Insufficient Data"}
	
	# Process data
	list_of_file_names = []
	for data in list_of_data:
		list_of_file_names.append(f'{data["farm_name"]}_{data["farm_patch_id"]}_{data["id"]}')
		update_success = DetectionResult.set_trained(
			farm_user=session["email"], 
			farm_name=data["farm_name"], 
			patch_id=data["farm_patch_id"], 
			id=data["id"]
		)
		if not update_success:
			return {"success": False, "message": "Failed to update result status"}
	
	# Initialize task
	task = train_model.delay(
		staging_bucket_path = current_app.config["VERTEX_TRAIN_STAGING_BUCKET"], 
		display_name = f"training_{session['email']}_{new_model_id}", 
		container_uri = current_app.config["VERTEX_TRAIN_CONTAINER_URI"],
		google_cloud_credentials_path = current_app.config["GOOGLE_CLOUD_SERVICE_ACCOUNT_CREDENTIALS_PATH"],
		bucket_name = current_app.config["GOOGLE_CLOUD_BUCKET_NAME"],
		email = session["email"], 
		new_model_id = new_model_id,
		list_of_filenames=list_of_file_names,
		base_model_id=base_model_id, 
		machine_type="n1-highmem-4"
	) # type: ignore
	
	# Create new model
	create_success = DetectionModel.create({
		"model_id": new_model_id, 
		"training_date": datetime.now(), 
		"name": model_name, 
		"num_data": len(list_of_data),
		"user": session["email"],
		"celery_task_id": task.id
	})
	if not create_success:
		return {"success": False, "message": "Failed to create new model"}
	
	return {"success": True, "task_id": task.id}

# Utility Function for retrieval of metrics from bucket storage
def retrieve_training_metrics(model:DetectionModel) -> dict[str, float | list[float]] | None:
	user_directory = UserDirectory(model.user)
	metrics = user_directory.retrieve_training_metrics(model.model_id)
	return metrics

# Retrieve Training task results route
@router.route("/query_all_models", methods=["GET"])
@permissions_required(is_user=True)
def query_all_models() -> dict[str, list[dict[str, str | float | list[float]]]]:
	models = DetectionModel.queryAllOwned(session["email"])
	output_list = []
	for m in models:
		# Retrieve Training Metrics
		metrics = retrieve_training_metrics(m)
		# Successful Run
		if metrics:
			metrics["test_map"] = metrics["test_map"] * 100
			output_list.append({
				"model_id": m.model_id,
				"name": m.name,
				"training_date": m.training_date.strftime("%Y-%m-%d %H:%M:%S"),
				"num_data": m.num_data,
				"status": "ACTIVE",
				"training_metrics": metrics,
			})
		else: # Check if Task Status is ERROR or RUNNING
			task = AsyncResult(m.celery_task_id)
			# Check if the task is available in Redis and still RUNNING/PENDING
			if task.state not in READY_STATES and not task.ready():
				output_list.append({
					"model_id": m.model_id,
					"name": m.name,
					"training_date": m.training_date.strftime("%Y-%m-%d %H:%M:%S"),
					"num_data": m.num_data,
					"status": "TRAINING"
				})
			else: # ERROR
				output_list.append({
						"model_id": m.model_id,
						"name": m.name,
						"training_date": m.training_date.strftime("%Y-%m-%d %H:%M:%S"),
						"num_data": m.num_data,
						"status": "ERROR"
					})
			
	return {"models": output_list}

# Retrieve Training task results route
@router.route("/query_all_model_selection", methods=["GET"])
@permissions_required(is_user=True)
def query_all_model_selection() -> dict[str, list[dict[str, str | float | list[float]]]]:
	list_of_models = []
	output_list = query_all_models()["models"]
	for model in output_list:
		if model["status"] == "ACTIVE":
			list_of_models.append({
				"model_id": model["model_id"],
				"name": model["name"]
			})
	return {"models": list_of_models}

@router.route("/delete_models", methods=["DELETE"])
@permissions_required(is_user=True)
def delete_models() -> dict[str, bool]:
	json = request.get_json()
	list_of_models = json["model_ids"]
		
	models = DetectionModel.deleteSelectedModels(list_of_models)

	user_directory = UserDirectory()

	success_flag = True
	for m in models:
		if not user_directory.deleteWeights(m):
			success_flag = False

	return {"success": (len(models) == len(list_of_models) and success_flag)}