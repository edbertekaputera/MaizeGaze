# Import Libraries
from celery import shared_task
from .utils import Detection

# Initialize Detection
detection_app = Detection()

# Shared Task for Detection Inference
@shared_task(ignore_result=False)
def detect_and_count(encoded_img_bytes:str) -> dict[str,int| str |
											  list[dict[str,float]]]:
	image = detection_app.convert_bytes_to_img(encoded_img_bytes)
	return detection_app.predict(image)