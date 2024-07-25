# Libraries
from flask import current_app
from typing_extensions import Self # type: ignore

# Local dependencies
from .sqlalchemy import db

# Views Schema
class DetectionResult(db.Model):
	__tablename__ = "DetectionResult"
	# attributes
	id = db.Column(db.String(250), nullable=False, primary_key=True)
	tassel_count = db.Column(db.Integer(), nullable=False)
	record_date = db.Column(db.DateTime(), nullable=False)
	name = db.Column(db.String(250), nullable=False)
	description = db.Column(db.String(250), nullable=False)

	# Part of composite key (qualifier)
	farm_name = db.Column(db.String(250), primary_key=True)
	farm_user = db.Column(db.String(250), primary_key=True)
	farm_patch_id = db.Column(db.String(250), primary_key=True)
	db.ForeignKeyConstraint(
		[farm_name, farm_user, farm_patch_id], 
		["CropPatch.farm_name", "CropPatch.farm_user", "CropPatch.patch_id"],
		ondelete="cascade",
		onupdate="cascade"
	)
	
	detectionResultToCropPatchRel = db.relationship("CropPatch", 
											back_populates="cropPatchToDetectionResultRel")

	@classmethod
	def queryAllResultHistory(cls, email:str) -> list[Self]:
		return cls.query.filter_by(farm_user=email).all()
	
	@classmethod
	def queryNumOfResultByFarm(cls, email:str, farm:str) -> int:
		return cls.query.filter_by(farm_user=email, farm_name=farm).count()
	
	@classmethod
	def queryNumOfResultByFarmPatch(cls, email:str, farm:str, patch_id:str) -> int:
		return cls.query.filter_by(farm_user=email, farm_name=farm, farm_patch_id=patch_id).count()
	
	@classmethod
	def queryResult(cls, farm_user:str, farm_name:str, farm_patch_id:str, id:str) -> Self | None:
		return cls.query.filter_by(farm_user=farm_user, farm_name=farm_name, farm_patch_id=farm_patch_id, id=id).one_or_none()
	
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
					if not result or cls.query.filter_by(**key).delete() == 0:
						continue
					list_of_results.append(result)
				db.session.commit()
		except BaseException as err:
			print(err)
			pass
		return list_of_results
	
	@classmethod
	def querySelectedResults(cls, results_pk:list[dict[str,str]]) -> list[Self]:
		list_of_results = []
		for key in results_pk:
			result = cls.queryResult(**key)
			if result:
				list_of_results.append(result)
		return list_of_results

	@classmethod
	def queryDailyStatistics(cls, email:str) -> list:
		return db.session.query(cls.farm_name, db.func.date(cls.record_date).label("record_date"), db.func.sum(cls.tassel_count).label("total_tassel_count")) \
			.filter_by(farm_user=email) \
			.group_by(cls.farm_name, db.func.date(cls.record_date)) \
			.all()
	
	@classmethod
	def queryDailyPerPatchStatistics(cls, email:str) -> list:
		return db.session.query(cls.farm_name, cls.farm_patch_id, db.func.date(cls.record_date).label("record_date"), db.func.sum(cls.tassel_count).label("total_tassel_count")) \
			.filter_by(farm_user=email) \
			.group_by(cls.farm_name, cls.farm_patch_id, db.func.date(cls.record_date)) \
			.all()
	
	@classmethod
	def update(cls, farm_user:str, farm_name:str, patch_id:str, id:str, tassel_count:int) -> bool:
		try:
			with current_app.app_context():
				current_result = cls.queryResult(str(farm_user), str(farm_name), str(patch_id), str(id))
				if not current_result:
					return False
				
				if int(tassel_count) and tassel_count != current_result.tassel_count:
					current_result.tassel_count = int(tassel_count)
		
				db.session.commit()
			return True
		except BaseException as e:
			print(e)
			return False

	
	
