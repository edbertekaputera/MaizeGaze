# Libraries
import os
from werkzeug.datastructures import FileStorage
from PIL import Image
import cv2
import numpy as np
from io import BytesIO 
from base64 import encodebytes
from app.db import DetectionResult
from flask import current_app, session

class UserDirectory():
	def __init__(self) -> None:
		self.__user_directory = os.path.join(current_app.config["LOCAL_STORAGE_PATH"], session["email"])
		self.__storage_limit = session["storage_limit"] * 1024 * 1024 * 1024
		
		if not os.path.isdir(self.__user_directory):
			os.mkdir(self.__user_directory)
			os.mkdir(os.path.join(self.__user_directory, "images"))
			os.mkdir(os.path.join(self.__user_directory, "labels"))

		self.__size = self.get_directory_size(self.__user_directory)

	def get_directory_size(self, path):
		"""
		Returns the total size of the directory and its contents in bytes.
		"""
		total_size = 0
		for entry in os.scandir(path):
			if entry.is_file():
				total_size += entry.stat().st_size
			elif entry.is_dir():
				total_size += self.get_directory_size(entry.path)
		return total_size
	
	def save(self, farm_name:str, id:str, image:FileStorage, annotations:list[dict[str, float]]) -> bool:
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
			# Save image
			image_pil.save(os.path.join(self.__user_directory, "images", f"{farm_name}_{id}.jpg"), format="JPEG")
			# Save txt
			with open(os.path.join(self.__user_directory, "labels", f"{farm_name}_{id}.txt"), "w") as f:
				for a in annotations:
					f.write(f"0 {a['x']} {a['y']} {a['width']} {a['height']}\n")
		except BaseException as err:
			print(err)
			return False
		return True
	
	# Convert Image to base64 bytes:
	def convert_img_to_bytes(self, img:Image.Image) -> str:
		img_bytes = BytesIO()
		img.save(img_bytes, format="PNG")
		return encodebytes(img_bytes.getvalue()).decode("ascii")
	
	def retrieveImage(self, result:DetectionResult) -> Image.Image:
		path = os.path.join(self.__user_directory, "images", f"{result.farm_name}_{result.id}.jpg")
		img = Image.open(path)
		return img
	
	def retrieveAnnotations(self, result:DetectionResult) -> list[dict[str, float]]:
		path = os.path.join(self.__user_directory, "labels", f"{result.farm_name}_{result.id}.txt")
		list_of_annots = []
		with open(path, "r") as f:
			for line in f.readlines():
				line = line.replace("\n", "")
				if line.strip() == "":
					continue
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


	


		

	