import os
from flask import Flask, request
from hashlib import sha256
from utils import copy_model_from_gcs, Detection

# Initialize Flask
app = Flask(__name__)

# Load the Base YOLOv9 model
base_model = Detection(os.path.join(os.environ["MODEL_DIR"], "base_weights.pt"))

@app.route('/test', methods=["GET"])
def test():
	if base_model:
		return {"success": True}, 200
	return {"success": False}, 500

# Utility
def get_predictions(email:str, b64_image:str, model_id:str|None = None) -> dict[str,int| str|list[dict[str,float]]]:
	image_pil = Detection.convert_bytes_to_img(b64_image)
	# Perform inference
	if model_id and len(model_id) == 36:
		# Get hashed email
		hashed_email = sha256(email.encode('utf-8')).hexdigest()
		# Copy Model
		copy_model_from_gcs(model_id=model_id, hashed_email=hashed_email)
		# Initialize trainer
		model_path = os.path.join(os.environ["MODEL_DIR"], "weights.pt")
		detection_app = Detection(model_path)
		return detection_app.predict(image_pil)
	return base_model.predict(image_pil)

@app.route('/predict', methods=['POST'])
def predict():
	# Request Body
	instances = request.get_json()["instances"]
	prediction_list = []
	for i in instances:
		email = i["email"]
		b64_image = i["b64_image"]
		model_id = i.get("model_id") # Can be None
		prediction_list.append(get_predictions(email=email, b64_image=b64_image, model_id=model_id))
	return {'predictions': prediction_list}, 200

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=8080)