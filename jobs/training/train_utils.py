from ultralytics import YOLO
import os
from sklearn.model_selection import train_test_split
import yaml
import pandas as pd

# Training Class
class Trainer():
	def __init__(self, local_storage_path:str = "/data") -> None:
		self.__data_directory = local_storage_path
		self.__model = YOLO(os.path.join(os.environ["MODEL_DIR"], "weights.pt"))
		self.__yaml_path = None

	def create_train_yaml(self, data, seed=42, path="temp_training.yaml") -> None:
		filenames = [os.path.join("./images", filename + ".jpg\n") for filename in data]		
		trainval, test = train_test_split(filenames, test_size=0.1, random_state=seed)
		train, val = train_test_split(trainval, test_size=0.22, random_state=seed)
		with open(os.path.join(self.__data_directory, "temp_train.txt"), "w") as train_file:
			train_file.writelines(train)
		with open(os.path.join(self.__data_directory, "temp_val.txt"), "w") as val_file:
			val_file.writelines(val)
		with open(os.path.join(self.__data_directory, "temp_test.txt"), "w") as test_file:
			test_file.writelines(test)
		train_yaml = {
			"path": self.__data_directory,
			"train": "temp_train.txt",
			"val": "temp_val.txt",
			"test": "temp_test.txt",
			'nc': 1,
 			'names': ['tassel']
		}
		with open(path, "w") as file:
			yaml.dump(train_yaml, file)
		self.__yaml_path = path

	def train(self, new_model_id:str, epoch:int=30, batch:int=8):
		train_results = self.__model.train(
			data=self.__yaml_path, 
			epochs=epoch,
			patience=epoch//10,  
			batch=batch,
			imgsz=640, 
			freeze=10,
			single_cls=True,
		)
		# Update model
		self.__model = YOLO(os.path.join(str(train_results.save_dir), "weights", "best.pt")) # type: ignore
		new_model_directory_path = os.path.join(os.environ["MODEL_DIR"], new_model_id)
		if not os.path.isdir(new_model_directory_path):
			os.mkdir(new_model_directory_path)
		self.__model.save(os.path.join(new_model_directory_path, "weights.pt"))
		
		# Training Metrics/Epoch
		epoch_stats = pd.read_csv(os.path.join(str(train_results.save_dir), "results.csv"))  # type: ignore
		map_values = epoch_stats["       metrics/mAP50(B)"]
		val_loss = epoch_stats["           val/box_loss"]
		train_loss = epoch_stats["         train/box_loss"]
		return {
			"train_loss": train_loss.to_list(),
			"val_loss": val_loss.to_list(),
			"val_map": map_values.to_list(),
		}
	
	def evaluate(self, batch:int=8):
		test_results = self.__model.val(
			data=self.__yaml_path, 
			batch=batch, 
			split="test"
		)
		return {
			"map" : test_results.results_dict["metrics/mAP50(B)"],
			"mae" : self.get_mean_absolute_error()
		}

	def get_mean_absolute_error(self):
		path = os.path.join(self.__data_directory, "temp_test.txt")
		errors = []
		sources = []
		with open(path, "r") as f:
			for i in f.readlines():
				x = (self.__data_directory + i[1:]).replace("\n", "")
				y = x.replace("images", "labels")[:-3] + "txt"
				if x.strip() != "":
					sources.append([x,y])
		for p in sources:
			preds = self.__model.predict(p[0], conf=0.4)
			preds_count = len(preds[0].boxes.xywhn)
			label_count = self.get_label_count(p[1])
			errors.append(abs(preds_count -  label_count))
		return sum(errors) / len(errors)

	def get_label_count(self, path):
		counts = 0
		with open(path, "r") as f:
			for i in f.readlines():
				x = i.replace("\n", "")
				if x.strip() != "":
					counts += 1
		return counts