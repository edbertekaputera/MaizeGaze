# Libraries
import os
from werkzeug.datastructures import FileStorage
from PIL import Image
from io import BytesIO

class UserDirectory():
	DEFAULT_STORAGE_LIMIT = 5 * 1024 * 1024 * 1024

	def __init__(self, path) -> None:
		self.__user_directory = path
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
	
	def save(self, id:str, image:FileStorage, annotations:list[dict[str, float]]) -> bool:
		image_pil = Image.open(BytesIO(image.stream.read()))
		# Get image size
		image_bytes = BytesIO()
		image_pil.save(image_bytes, format="JPEG")
		image_size = len(image_bytes.getvalue())
		estimated_txt_size = len(annotations) * 18
		# Check storage budget
		if self.__size + image_size + estimated_txt_size > self.DEFAULT_STORAGE_LIMIT:
			return False
		try:
			# Save image
			image_pil.save(os.path.join(self.__user_directory, "images", f"{id}.jpg"), format="JPEG")
			# Save txt
			with open(os.path.join(self.__user_directory, "labels", f"{id}.txt"), "w") as f:
				for a in annotations:
					f.write(f"0 {a['x']} {a['y']} {a['width']} {a['height']}\n")
		except BaseException as err:
			print(err)
			return False
		return True
	

		

	
