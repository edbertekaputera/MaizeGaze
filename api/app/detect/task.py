# Import Libraries
from celery import shared_task
from google.cloud import aiplatform
from google.oauth2 import service_account
from .utils import predict_custom_trained_model_sample
from typing import Optional

# Shared Task for Detection Inference
@shared_task(ignore_result=False)
def detect_and_count(
	b64_img_bytes:str,
	email:str,
	project_id:str,
	endpoint_id:str,
	location:str,
	google_cloud_credentials_path:str,
	model_id:str|None = None
	):
	google_cloud_credentials = service_account.Credentials.from_service_account_file(google_cloud_credentials_path)
	predictions = predict_custom_trained_model_sample(
		project=project_id,
		endpoint_id=endpoint_id,
		location=location,
		api_endpoint=f"{location}-aiplatform.googleapis.com",
		credentials=google_cloud_credentials,
		instances={ "b64_image": b64_img_bytes, "email": email, "model_id": model_id}
	)
	return predictions


# Shared Task for Training Job
@shared_task(ignore_result=False)
def train_model(
	staging_bucket_path:str, 
	display_name:str, 
	container_uri:str,
	google_cloud_credentials_path:str,
	bucket_name:str,
	email:str, 
	new_model_id:str,
	list_of_filenames:list[str],
	base_model_id:Optional[str] = None, 
	batch_size:Optional[int] = 8,
	epochs:Optional[int] = 30,
	machine_type:str = "n1-standard-4",
	) -> None:
	
	google_cloud_credentials = service_account.Credentials.from_service_account_file(google_cloud_credentials_path)
	
	job = aiplatform.CustomContainerTrainingJob(
		credentials=google_cloud_credentials,
		display_name=display_name,
		staging_bucket=staging_bucket_path,
		container_uri=container_uri
	)

	args_list:list[str] = [email, new_model_id, *list_of_filenames]

	if base_model_id:
		args_list.append("--base-model-id")
		args_list.append(base_model_id)
	if batch_size:
		args_list.append("--batch-size")
		args_list.append(str(batch_size))
	if epochs:
		args_list.append("--epochs")
		args_list.append(str(epochs))

	job.run(
		replica_count=1,
		machine_type=machine_type,
		environment_variables= {"BUCKET_NAME": bucket_name},
		args=args_list # type: ignore
	)
