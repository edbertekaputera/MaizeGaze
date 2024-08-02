from train_utils import Trainer
import os
import subprocess
import typer
from typing import Annotated, List, Optional
from hashlib import sha256
import json

print(f"""
ENVIRONMENT VARIABLES FROM JOB EXEC:
- BUCKET_NAME = {os.environ['BUCKET_NAME']}
""")

def copy_files_from_gcs(hashed_email:str, file_names:list[str]):
	bucket_name = os.environ['BUCKET_NAME']
	for file_name in file_names:
		img_path = os.path.join("images", file_name + ".jpg")
		txt_path = os.path.join("labels", file_name + ".txt")
		subprocess.run(['gsutil', 'cp', f'gs://{bucket_name}/user_data_storage/{hashed_email}/{img_path}', '/data/images'])
		subprocess.run(['gsutil', 'cp', f'gs://{bucket_name}/user_data_storage/{hashed_email}/{txt_path}', '/data/labels'])
	print("Files copied successfully")

def copy_model_from_gcs(hashed_email:str, base_model_id:str|None):
	bucket_name = os.environ['BUCKET_NAME']
	if not base_model_id:
		subprocess.run(['gsutil', 'cp', f'gs://{bucket_name}/model_artifacts/weights.pt', os.environ["MODEL_DIR"]])
	else:
		model_path = os.path.join("user_data_storage", hashed_email, "models", base_model_id, "weights.pt")
		subprocess.run(['gsutil', 'cp', f'gs://{bucket_name}/{model_path}', os.environ["MODEL_DIR"]])

def train(
		email: Annotated[str, typer.Argument()], 
		new_model_id: Annotated[str, typer.Argument()], 
		filenames:Annotated[List[str], typer.Argument()],
		base_model_id:Annotated[Optional[str], typer.Option()] = None,
		batch_size:Annotated[Optional[int], typer.Option()] = 8,
		epochs:Annotated[Optional[int], typer.Option()] = 30,
	):
	print("email: ", email)
	print("new_model_id: ", new_model_id)
	print("filenames: ", filenames)
	print("base_model_id: ", base_model_id)
	print("batch_size: ", batch_size)
	print("epochs: ", epochs)

	# Checks
	if len(filenames) == 0:
		print("Insufficient Data")
		raise RuntimeError
	if not batch_size or batch_size <= 0:
		print("Invalid Batch Size")
		raise RuntimeError
	if not epochs or epochs <= 0:
		print("Invalid Epochs")
		raise RuntimeError
	
	# Get hashed email
	hashed_email = sha256(email.encode('utf-8')).hexdigest()
	# Copy data
	copy_files_from_gcs(file_names=filenames, hashed_email=hashed_email)
	# Copy Model
	copy_model_from_gcs(base_model_id=base_model_id, hashed_email=hashed_email)
	# Initialize trainer
	trainer = Trainer("/data")
	# Generate YAML
	trainer.create_train_yaml(data=filenames)
	# Train
	results = trainer.train(
		new_model_id=new_model_id, 
		epoch=epochs, batch=batch_size) #type: ignore
	# Evaluate
	test_result = trainer.evaluate(batch=batch_size) #type: ignore
	results["test_map"] = test_result["map"]
	results["test_mae"] = test_result["mae"]
	# Serialize json results
	json_metrics = json.dumps(results, indent=3)
	# Save metrics
	local_model_path = os.path.join(os.environ["MODEL_DIR"], new_model_id)
	with open(os.path.join(local_model_path, "metrics.json"), "w") as json_file:
		json_file.write(json_metrics)
	# Store in Cloud
	bucket_name = os.environ['BUCKET_NAME']
	model_path = os.path.join("user_data_storage", hashed_email, "models")
	subprocess.run(['gsutil', 'cp', "-R", local_model_path, f'gs://{bucket_name}/{model_path}'])

if __name__ == "__main__":
	typer.run(train)