# Libraries
from typing_extensions import Self # type: ignore
from flask import current_app

# Local dependencies
from .sqlalchemy import db

# Views Schema
class DetectionModel(db.Model):
	__tablename__ = "DetectionModel"
	# attributes
	model_id = db.Column(db.String(250), nullable=False, primary_key=True)
	training_date = db.Column(db.DateTime(), nullable=False)
	name = db.Column(db.String(250), nullable=False)
	num_data = db.Column(db.Integer(), nullable=False)
	celery_task_id = db.Column(db.String(250), nullable=False)

	# Foreign Key
	user = db.Column(db.String(250), db.ForeignKey("User.email"), nullable=False)
	detectionModelToUserRel = db.relationship("User", back_populates="userToDetectionModelRel",
									foreign_keys="DetectionModel.user")
	

	
	@classmethod
	def queryAllOwned(cls, email:str) -> list[Self]:
		return cls.query.filter_by(user=email).all()
	
	@classmethod
	def get(cls, id) -> Self | None:
		return cls.query.filter_by(model_id=id).one_or_none()
	
	@classmethod
	def create(cls, data:dict) -> bool:
		try:
			with current_app.app_context():
				new_result = cls(**data)
				db.session.add(new_result)
				db.session.commit()
			return True
		except BaseException as e:
			print(e)
			return False
	
	@classmethod
	def create(cls, data:dict) -> bool:
		try:
			with current_app.app_context():
				new_result = cls(**data)
				db.session.add(new_result)
				db.session.commit()
			return True
		except BaseException as e:
			print(e)
			return False
	
	@classmethod
	def deleteSelectedModels(cls,model_ids:list[str]) -> list[Self]:
		list_of_models = []
		try:
			with current_app.app_context():
				for id in model_ids:
					model = cls.get(id)
					if not model or cls.query.filter_by(model_id=id).delete() == 0:
						continue
					list_of_models.append(model)
				db.session.commit()
		except BaseException as err:
			print(err)
			pass
		return list_of_models