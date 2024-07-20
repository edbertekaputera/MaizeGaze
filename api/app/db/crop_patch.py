# Libraries
from typing_extensions import Self # type: ignore
from flask import current_app

# Local dependencies
from .sqlalchemy import db

# Views Schema
class CropPatch(db.Model):
	__tablename__ = "CropPatch"
	# attributes
	patch_id = db.Column(db.String(250), nullable=False, primary_key=True)
	name = db.Column(db.String(250), nullable=False)
	land_size = db.Column(db.Float(), nullable=False)


	# Part of composite key (qualifier)
	farm_name = db.Column(db.String(250), primary_key=True)
	farm_user = db.Column(db.String(250), primary_key=True)
	db.ForeignKeyConstraint(
		[farm_name, farm_user], 
		["Farm.name", "Farm.user"],
		ondelete="cascade",
		onupdate="cascade"
	)

	cropPatchToFarmRel = db.relationship("Farm", 
											back_populates="farmToCropPatchRel",
											cascade="all, delete, save-update")
	
	# Relationship
	cropPatchToDetectionResultRel = db.relationship("DetectionResult", 
											back_populates="detectionResultToCropPatchRel", 
											cascade="all, delete, save-update")
	
	@classmethod
	def queryAllCropPatchesOwned(cls, email:str) -> list[Self]:
		return cls.query.filter_by(farm_user=email).all()
	
	@classmethod
	def queryTotalFarmSize(cls, email:str, farm_name:str) -> float:
		output = db.session.query(db.func.sum(cls.land_size).label("total_land_size")) \
			.filter_by(farm_user=email, farm_name=farm_name) \
			.one_or_none()
		if not output:
			return 0
		return output.total_land_size
	
	@classmethod
	def queryAllOwnedByFarm(cls, email:str, farm_name:str) -> list[Self]:
		return cls.query.filter_by(farm_user=email, farm_name=farm_name).all()

	@classmethod
	def get(cls, farm_user, farm_name, patch_id) -> Self | None:
		return cls.query.filter_by(farm_name=farm_name, farm_user=farm_user, patch_id=patch_id).one_or_none()
	
	@classmethod
	def createCropPatch(cls, details:dict) -> bool:
		try:
			with current_app.app_context():
				new_result = cls(**details)
				db.session.add(new_result)
				db.session.commit()
			return True
		except BaseException as e:
			print(e)
			return False
	
	@classmethod
	def updateCropPatch(cls, details:dict[str,str|float|bool]) -> bool:
		try:
			with current_app.app_context():
				patch = cls.get(farm_user=details["farm_user"], farm_name=details["farm_name"], patch_id=details["patch_id"])
				if not patch:
					return cls.createCropPatch(details=details)
				if details["deleted"]:
					return False
				if details.get("name") != patch.name:
					patch.name = str(details["name"])
				if details.get("land_size") != patch.land_size and float(details["land_size"]) > 0:
					patch.land_size = float(details["land_size"])
				db.session.commit()
			return True
		except:
			return False	
		
	@classmethod
	def deleteAllOwnedByFarm(cls, email:str, farm_name:str) -> bool:
		try:
			with current_app.app_context():
				patches = cls.query.filter_by(farm_user=email, farm_name=farm_name).all()
				for p in patches:
					db.session.delete(p)
				db.session.commit()
			return True
		except:
			return False	
	
	