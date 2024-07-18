# Libraries
from typing_extensions import Self # type: ignore

# Local dependencies
from .sqlalchemy import db

# Views Schema
class Farm(db.Model):
	__tablename__ = "Farm"
	# attributes
	name = db.Column(db.String(250), nullable=False, primary_key=True)
	city = db.Column(db.String(250), nullable=False)
	country = db.Column(db.String(250), nullable=False)
	address = db.Column(db.String(250), nullable=False)
	description = db.Column(db.String(250), nullable=False)

	# Part of composite key (qualifier)
	user = db.Column(db.String(250), db.ForeignKey("User.email"), nullable=False, primary_key=True)
	farmToUserRel = db.relationship("User", back_populates="userToFarmRel", cascade="all, delete, save-update",
									foreign_keys="Farm.user")
	
	# Relationship
	farmToCropPatchRel = db.relationship("CropPatch", 
											back_populates="cropPatchToFarmRel", 
											cascade="all, delete, save-update")
	
	@classmethod
	def queryAllFarmsOwned(cls, email:str) -> list[Self]:
		return cls.query.filter_by(user=email).all()