# Libraries
import os
from werkzeug.datastructures import FileStorage
import zipfile
from PIL import Image
import cv2
import numpy as np
from io import BytesIO 
from base64 import encodebytes
from app.db import DetectionResult
from flask import current_app, session
from hashlib import sha256
from json import load as json_load
from .cloud_utils import GoogleBucket

class UserDirectory():
	def __init__(self, email=None) -> None:
		if email:
			hashed_email = sha256(email.encode('utf-8')).hexdigest()
		else: 
			hashed_email = sha256(session["email"].encode('utf-8')).hexdigest()
		self.__storage_limit = session["storage_limit"] * 1024 * 1024

		if current_app.config["USE_LOCAL_STORAGE"]: # Local
			self.__user_directory = os.path.join(current_app.config["LOCAL_STORAGE_PATH"], hashed_email)
			if not os.path.isdir(self.__user_directory):
				os.mkdir(self.__user_directory)
				os.mkdir(os.path.join(self.__user_directory, "images"))
				os.mkdir(os.path.join(self.__user_directory, "labels"))
				os.mkdir(os.path.join(self.__user_directory, "models"))
		else: #Cloud Bucket
			self.__bucket = GoogleBucket(current_app.config["GOOGLE_CLOUD_BUCKET_NAME"], current_app.config["GOOGLE_CLOUD_SERVICE_ACCOUNT_CREDENTIALS_PATH"])
			self.__user_directory = os.path.join("user_data_storage", hashed_email)
			if not self.__bucket.isdir(self.__user_directory):
				self.__bucket.mkdir(self.__user_directory)
				self.__bucket.mkdir(os.path.join(self.__user_directory, "images"))
				self.__bucket.mkdir(os.path.join(self.__user_directory, "labels"))
				self.__bucket.mkdir(os.path.join(self.__user_directory, "models"))
				
		self.__size = self.get_directory_size(self.__user_directory)


	def get_directory_size(self, path):
		"""
		Returns the total size of the directory and its contents in bytes.
		"""
		if current_app.config["USE_LOCAL_STORAGE"]: # Local
			total_size = 0
			for entry in os.scandir(path):
				if entry.is_file():
					if entry.name == ".DS_Store":
						continue
					total_size += entry.stat().st_size
				elif entry.is_dir():
					total_size += self.get_directory_size(entry.path)
			return total_size
		else: #Cloud Bucket
			return self.__bucket.get_directory_size(path)
	
	def get_size(self) -> int:
		return self.__size
	
	def save(self, farm_name:str, farm_patch_id:str, id:str, image:FileStorage, annotations:list[dict[str, float]]) -> bool:
		"""Saves detection result files into bucket storage

		Args:
			farm_name (str): farm name
			farm_patch_id (str): farm patch id
			id (str): detection result id
			image (FileStorage): image passed through request.
			annotations (list[dict[str, float]]): list of annotations.

		Returns:
			bool: success.
		"""
		image_pil = Image.open(BytesIO(image.stream.read()))
		# Get image size
		image_bytes = BytesIO()
		image_pil.save(image_bytes, format="JPEG")
		image_size = len(image_bytes.getvalue())
		estimated_txt_size = len(annotations) * 18
		# Check storage budget
		if self.__size + image_size + estimated_txt_size > self.__storage_limit:
			return False
		try:
			image_path = os.path.join(self.__user_directory, "images", f"{farm_name}_{farm_patch_id}_{id}.jpg")
			txt_path = os.path.join(self.__user_directory, "labels", f"{farm_name}_{farm_patch_id}_{id}.txt")
			annotation_texts = [f"0 {a['x']} {a['y']} {a['width']} {a['height']}\n" for a in annotations]
			if current_app.config["USE_LOCAL_STORAGE"]: # Local
				# Save image
				image_pil.save(image_path, format="JPEG")
				# Save txt
				with open(txt_path, "w") as f:
					for line in annotation_texts:
						f.write(line)
			else: #Cloud Bucket
				# Save image
				self.__bucket.save_image(path=image_path ,image=image_pil)
				self.__bucket.save_txt(path=txt_path, iterable_str_lines=annotation_texts)
		except BaseException as err:
			print(err)
			return False
		return True
	
	def delete(self, result:DetectionResult) -> bool:
		"""Deletes detection result files in bucket storage

		Args:
			result (DetectionResult): DetectionResult instance

		Returns:
			bool: success
		"""
		try:
			image_path = os.path.join(self.__user_directory, "images", f"{result.farm_name}_{result.farm_patch_id}_{result.id}.jpg")
			txt_path = os.path.join(self.__user_directory, "labels", f"{result.farm_name}_{result.farm_patch_id}_{result.id}.txt")
			if current_app.config["USE_LOCAL_STORAGE"]: # Local
				os.remove(image_path)		
				os.remove(txt_path)
			else: #Cloud Bucket
				self.__bucket.remove(image_path)
				self.__bucket.remove(txt_path)
		except BaseException as err:
			print(err)
			return False
		return True
	
	def convert_img_to_bytes(self, img:Image.Image) -> str:
		"""Converts image to base64 bytes"""
		img_bytes = BytesIO()
		img.save(img_bytes, format="PNG")
		return encodebytes(img_bytes.getvalue()).decode("ascii")
	
	def retrieveImage(self, result:DetectionResult) -> Image.Image:
		"""Retrieves image (PIL.Image.Image) given result (DetectionResult)."""
		path = os.path.join(self.__user_directory, "images", f"{result.farm_name}_{result.farm_patch_id}_{result.id}.jpg")
		if current_app.config["USE_LOCAL_STORAGE"]: # Local
			img = Image.open(path)			
		else: #Cloud Bucket
			img = self.__bucket.open_image(path)
		return img # type: ignore
	
	def retrieveAnnotations(self, result:DetectionResult) -> list[dict[str, float]]:
		"""Retrieves annotations given result (DetectionResult)."""
		path = os.path.join(self.__user_directory, "labels", f"{result.farm_name}_{result.farm_patch_id}_{result.id}.txt")
		lines = []
		if current_app.config["USE_LOCAL_STORAGE"]: # Local
			with open(path, "r") as f:
				for line in f.readlines():
					line = line.replace("\n", "")
					if line.strip() == "":
						continue
					lines.append(line)
		else: #Cloud Bucket
			lines:list[str] = self.__bucket.open_txt(path) # type: ignore
		# Process
		list_of_annots = []
		for line in lines:
			splitted = line.split(" ")
			x, y, width, height = [float(i) for i in splitted[1:]]
			list_of_annots.append({
				"x": x,
				"y": y,
				"width": width,
				"height": height
			})
		return list_of_annots
	
	def box_label(self, image:np.ndarray, box:dict[str,float], label:str="", color=(256, 0, 256), txt_color=(255, 255, 255)):
		"""Annotates an image with a given detection box"""
		lw = max(round(sum(image.shape) / 2 * 0.002), 2)
		p1 = ( int((box["x"] - 0.5 * box["width"]) * image.shape[1]), int((box["y"] - 0.5 * box["height"]) * image.shape[0]) )
		p2 = ( int((box["x"] + 0.5 * box["width"]) * image.shape[1]), int((box["y"] + 0.5 * box["height"]) * image.shape[0]) )
		cv2.rectangle(image, p1, p2, color, thickness=lw, lineType=cv2.LINE_AA)
		tf = max(lw - 1, 1)  # font thickness
		w, h = cv2.getTextSize(label, 0, fontScale=lw / 3, thickness=tf)[0]  # text width, height
		outside = p1[1] - h >= 3
		p2 = p1[0] + w, p1[1] - h - 3 if outside else p1[1] + h + 3
		cv2.rectangle(image, p1, p2, color, -1, cv2.LINE_AA)  # filled
		cv2.putText(image,
					label, (p1[0], p1[1] - 2 if outside else p1[1] + h + 2),
					0,
					lw / 3,
					txt_color,
					thickness=tf,
					lineType=cv2.LINE_AA)
			
	def retrieveResource(self, result:DetectionResult) -> dict[str, str | list[dict[str,float]]]:
		"""Retrieves detection result files from bucket storage

		Args:
			result (DetectionResult): Detection Result instance.

		Returns:
			dict[str, str | list[dict[str,float]]]: dictionary containing 
				- original_image: original image base64 bytes,
				- annotated_image: annotated image base64 bytes,
				- annotations: list of annotations.
		"""
		img = self.retrieveImage(result)
		annotations = self.retrieveAnnotations(result)
		base64_img = self.convert_img_to_bytes(img)

		# Annotate img
		np_img = np.array(img)
		for i in range(len(annotations)):
			self.box_label(np_img, annotations[i], str(i))

		annotated_img = Image.fromarray(np_img)
		base64_annotated_img = self.convert_img_to_bytes(annotated_img)
		return {
			"original_image": base64_img,
			"annotated_image": base64_annotated_img,
			"annotations": annotations
		}
	
	def downloadZipped(self, results:list[DetectionResult]) -> BytesIO:
		"""Reads detection result files a zip file buffer

		Args:
			results (list[DetectionResult]): list of Detection Result instances

		Returns:
			BytesIO: Zip File Buffer
		"""
		zip_buffer = BytesIO()
		with zipfile.ZipFile(zip_buffer, mode="w") as zip_file:
			# Directories
			zip_file.writestr("images/", "")
			zip_file.writestr("labels/", "")
			if current_app.config["USE_LOCAL_STORAGE"]: # Local
				for r in results:
					image_path = os.path.join(self.__user_directory, "images", f"{r.farm_name}_{r.farm_patch_id}_{r.id}.jpg")
					zip_file.write(filename=image_path, arcname=f"images/{r.farm_name}_{r.farm_patch_id}_{r.id}.jpg")
					txt_path = os.path.join(self.__user_directory, "labels", f"{r.farm_name}_{r.farm_patch_id}_{r.id}.txt")	
					zip_file.write(filename=txt_path, arcname=f"labels/{r.farm_name}_{r.farm_patch_id}_{r.id}.txt")
			else: #Cloud Bucket
				for r in results:
					image_path = os.path.join(self.__user_directory, "images", f"{r.farm_name}_{r.farm_patch_id}_{r.id}.jpg")
					img_bytes:bytes = self.__bucket.download_bytes(image_path) # type:ignore
					zip_file.writestr(f"images/{r.farm_name}_{r.farm_patch_id}_{r.id}.jpg", img_bytes)
					txt_path = os.path.join(self.__user_directory, "labels", f"{r.farm_name}_{r.farm_patch_id}_{r.id}.txt")	
					txt_bytes:bytes = self.__bucket.download_bytes(txt_path) # type:ignore
					zip_file.writestr(f"labels/{r.farm_name}_{r.farm_patch_id}_{r.id}.txt", txt_bytes)
		return zip_buffer

	def replace(self, result:DetectionResult, annotations:list[dict[str, float]]) -> bool:
		
		# retrieve old annotation 
		old_annotations = self.retrieveAnnotations(result)
		old_estimated_txt_size = len(old_annotations) * 18
		new_estimated_txt_size = len(annotations) * 18

		# Check storage budget
		if self.__size +  new_estimated_txt_size - old_estimated_txt_size > self.__storage_limit:
			return False
		try:
			# Replace txt
			list_of_annotations = [f"0 {a['x']} {a['y']} {a['width']} {a['height']}\n" for a in annotations]
			txt_path = os.path.join(self.__user_directory, "labels", f"{result.farm_name}_{result.farm_patch_id}_{result.id}.txt")
			if current_app.config["USE_LOCAL_STORAGE"]: # Local
				with open(txt_path, "w") as f:
					for line in list_of_annotations:
						f.write(line)
			else: #Cloud Bucket
				self.__bucket.save_txt(txt_path, list_of_annotations)
		except Exception as err:
			print(err)
			return False
		return True
	
	def retrieve_training_metrics(self, model_id:str) -> dict | None:
		json_path = os.path.join(self.__user_directory, "models", model_id, "metrics.json")
		if current_app.config["USE_LOCAL_STORAGE"]: # Local
			# Opening JSON file
			with open('data.json') as json_file:
				data = json_load(json_file)
		else: #Cloud Bucket
			data = self.__bucket.download_json(json_path)
		return data
	
	def upload_temporary_image(self, image:Image.Image, filename:str) -> str:
		if current_app.config["USE_LOCAL_STORAGE"]: # Local
				image_path = os.path.join(current_app.config["LOCAL_STORAGE_PATH"], filename)
				image.save(image_path, format="PNG")
		else: #Cloud Bucket
			image_path = os.path.join("temporary_image_artifacts", filename)
			self.__bucket.save_image(image_path, image, format="PNG")
		return image_path

	


		

	
