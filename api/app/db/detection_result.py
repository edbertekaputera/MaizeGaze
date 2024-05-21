# Libraries
from flask import current_app
from typing_extensions import Self # type: ignore
from datetime import date

# Local dependencies
from .sqlalchemy import db

# Views Schema
class DetectionResult(db.Model):
	__tablename__ = "DetectionResult"
	# attributes
	id = db.Column(db.String(250), nullable=False, primary_key=True)
	tassel_count = db.Column(db.Integer(), nullable=False)
	record_date = db.Column(db.Date(), nullable=False)
	name = db.Column(db.String(250), nullable=False)
	description = db.Column(db.String(250), nullable=False)

	# Part of composite key (qualifier)
	farm_name = db.Column(db.String(250), primary_key=True)
	farm_user = db.Column(db.String(250), primary_key=True)
	db.ForeignKeyConstraint(
		[farm_name, farm_user], 
		["Farm.name", "Farm.user"],
		ondelete="cascade",
		onupdate="cascade"
	)
	
	detectionResultToFarmRel = db.relationship("Farm", 
											back_populates="farmToDetectionResultRel",
											cascade="all, delete, save-update")

	
	@classmethod
	def queryAllResultHistory(cls, email:str) -> list[Self]:
		return cls.query.filter_by(farm_user=email).all()
	
	@classmethod
	def queryResult(cls, email:str, farm_name:str, id:str) -> Self | None:
		return cls.query.filter_by(farm_user=email, farm_name=farm_name, id=id).one_or_none()
	
	@classmethod
	def save(cls, data:dict) -> bool:
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
	def deleteSelectedResults(cls, results_pk:list[dict[str,str]]) -> list[Self]:
		list_of_results = []
		try:
			with current_app.app_context():
				for key in results_pk:
					result = cls.queryResult(**key)
					cls.query.filter_by(**key).delete()
					list_of_results.append(result)
				db.session.commit()
		except:
			pass
		return list_of_results
	
	@classmethod
	def querySelectedResults(cls, results_pk:list[dict[str,str]]) -> list[Self]:
		list_of_results = []
		for key in results_pk:
			result = cls.queryResult(**key)
			list_of_results.append(result)
		return list_of_results

	
 
 
 
	
	