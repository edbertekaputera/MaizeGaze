# Libraries
from typing_extensions import Self # type: ignore

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
	def get(cls, farm_user, farm_name, patch_id) -> Self | None:
		return cls.query.filter_by(farm_name=farm_name, farm_user=farm_user, patch_id=patch_id).one_or_none()