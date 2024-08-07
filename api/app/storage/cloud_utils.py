from google.cloud import storage
from google.oauth2.service_account import Credentials
from io import BytesIO
from json import loads as json_loads
from PIL import Image

class GoogleBucket():
	def __init__(self, bucket_id:str, google_credentials_path:str) -> None:
		credentials = Credentials.from_service_account_file(google_credentials_path)
		client = storage.Client(credentials=credentials)
		self.__bucket = client.get_bucket(bucket_id)

	def isdir(self, path:str) -> bool:
		return any(self.__bucket.list_blobs(prefix=f"{path}/", delimiter='/'))

	def mkdir(self, path:str) -> bool:
		try:
			if not self.isdir(f"{path}/"):
				blob = self.__bucket.blob(f'{path}/')
				blob.upload_from_string('')	
				return True	
			return False
		except BaseException as err:
			print(err)
			return False

	def scandir(self, path:str) -> list[storage.Blob]:
		return list(self.__bucket.list_blobs(prefix=f'{path}/'))
	
	def remove_directory(self, path:str) -> bool:
		try:
			for blob in self.scandir(path)[::-1]:
				blob.delete()
			return True
		except BaseException as err:
			print(err)
			return False

	def remove(self, path:str) -> bool:
		try:
			blob = self.__bucket.get_blob(path)
			if blob:
				blob.delete()
				return True
			return False
		except BaseException as err:
			print(err)
			return False
		
	def get_directory_size(self, path):
		total_size = 0
		for blob in self.__bucket.list_blobs(prefix=f'{path}/'):
			total_size += blob.size
		return total_size

	def save_image(self, path:str, image:Image.Image, format:str="JPEG"):
		try:
			img_bytes = BytesIO()
			image.save(img_bytes, format=format)
			img_bytes.seek(0)
			blob = self.__bucket.blob(path)
			blob.upload_from_file(img_bytes, content_type=f'image/{format.lower()}')
			return True
		except BaseException as err:
			print(err)
			return False

	def save_txt(self, path, iterable_str_lines):
		try:
			blob = self.__bucket.blob(path)
			with blob.open("w") as f:
				for line in iterable_str_lines:
					f.write(line)
			return True
		except BaseException as err:
			print(err)
			return False
	
	def open_image(self, path) -> Image.Image | None:
		blob = self.__bucket.get_blob(path)
		if not blob:
			return None
		byte_stream = BytesIO(blob.download_as_bytes())
		# Open the image using PIL
		image = Image.open(byte_stream)
		return image
	
	def open_txt(self, path) -> list[str] | None:
		blob = self.__bucket.get_blob(path)
		if not blob:
			return None
		lines = []
		with blob.open("r") as f:
			for line in f.readlines():
				lines.append(line)
		return lines
	
	def download_bytes(self, path) -> bytes | None:
		blob = self.__bucket.get_blob(path)
		if not blob:
			return None
		return blob.download_as_bytes()
	
	def download_json(self, path) -> dict | None:
		blob = self.__bucket.get_blob(path)
		if not blob:
			return None
		string_val = blob.download_as_string()
		return json_loads(string_val)