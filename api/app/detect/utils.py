from ultralytics import YOLO
from ultralytics.engine.results import Results
from PIL import Image
from io import BytesIO # type: ignore
from base64 import encodebytes, decodebytes # type: ignore
import numpy as np
import torch as pt
import cv2

class Detection():
	def __init__(self) -> None:
		self.__model = YOLO("model/yolov9e_mtdc_puskul_adam.pt")
	
	def predict(self, image:Image.Image) -> dict[str,int| str|
											  list[dict[str,float]]]:
		
		results = self.__model.predict(source=image)[0] # type: ignore
		annotated_image = self.annotate_image(image, results)
		normalized_annotations = results.boxes.xywhn
		annotations = []
		for a in normalized_annotations:
			annotations.append({
				"x":float(a[0]), 
				"y":float(a[1]), 
				"width":float(a[2]), 
				"height":float(a[3])} 
			)

		return {
			"annotated_image": self.convert_img_to_bytes(annotated_image), 
		  	"annotations": annotations,
			"tassel_count": len(results.boxes),
		}

	# Convert Image to base64 bytes:
	def convert_img_to_bytes(self, img:Image.Image) -> str:
		img_bytes = BytesIO()
		img.save(img_bytes, format="PNG")
		return encodebytes(img_bytes.getvalue()).decode("ascii")

	# Convert base64 bytes to Image:
	def convert_bytes_to_img(self, bytes:str) -> Image.Image:
		img_bytes = BytesIO(decodebytes(bytes.encode("ascii")))
		return Image.open(img_bytes)
	
	def annotate_image(self, image:Image.Image, results:Results) -> Image.Image:
		np_image = np.array(image)
		if results.boxes:
			i = 0
			for x1,y1,x2,y2 in results.boxes.xyxy:
				i += 1
				self.__draw_box_label(np_image, x1, y1, x2, y2, label=str(i))
		pil_img = Image.fromarray(np_image, mode="RGB")
		return pil_img

	def __draw_box_label(self, image:np.ndarray, x1, y1, x2, y2, label='', color=(256, 0, 256), txt_color=(255, 255, 255)) -> None:
		lw = max(round(sum(image.shape) / 2 * 0.002), 2)
		p1 = (int(x1), int(y1))
		p2 = (int(x2), int(y2))
		cv2.rectangle(image, p1, p2, color, thickness=lw, lineType=cv2.LINE_AA)
		if label:
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

