import google.generativeai as genai
import json
from PIL import Image
from io import BytesIO 
from base64 import encodebytes, decodebytes

# GeminiModel Inference Class
class GeminiModel():
	def __init__(self, system_instruction:str, schema_class:object, model_id:str='gemini-1.5-flash') -> None:
		self.__model = genai.GenerativeModel(
			model_id, 
			system_instruction=system_instruction, 
			generation_config={
				"response_mime_type": "application/json", 
				"response_schema": schema_class
			}) # type: ignore
		
	def generate(self, description:str, image:Image.Image|None = None) -> dict[str, str|list|dict]:
		input_prompt = [description]
		if image is not None:
			input_prompt.insert(0, image) # type: ignore
		response = self.__model.generate_content(input_prompt)
		json_response = json.loads(response.text)
		return json_response
	
	# Convert Image to base64 bytes:
	def convert_img_to_bytes(self, img:Image.Image) -> str:
		img_bytes = BytesIO()
		img.save(img_bytes, format="PNG")
		return encodebytes(img_bytes.getvalue()).decode("ascii")

	# Convert base64 bytes to Image:
	def convert_bytes_to_img(self, bytes:str) -> Image.Image:
		img_bytes = BytesIO(decodebytes(bytes.encode("ascii")))
		return Image.open(img_bytes)