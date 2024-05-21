# Libraries
from flask import current_app
from typing_extensions import Self # type: ignore
from datetime import date

# Local dependencies
from .sqlalchemy import db
from .detection_result import DetectionResult

# Views Schema
class Farm(db.Model):
	__tablename__ = "Farm"
	# attributes
	name = db.Column(db.String(250), nullable=False, primary_key=True)
	city = db.Column(db.String(250), nullable=False)
	country = db.Column(db.String(250), nullable=False)
	address = db.Column(db.String(250), nullable=False)
	land_size = db.Column(db.Float(), nullable=False)

	# Part of composite key (qualifier)
	user = db.Column(db.String(250), db.ForeignKey("User.email"), nullable=False, primary_key=True)
	farmToUserRel = db.relationship("User", back_populates="userToFarmRel", cascade="all, delete, save-update",
									foreign_keys="Farm.user")
	
	# Relationship
	farmToDetectionResultRel = db.relationship("DetectionResult", 
											back_populates="detectionResultToFarmRel", 
											cascade="all, delete, save-update")
	
	@classmethod
	def queryAllFarmsOwned(cls, email:str) -> list[Self]:
		return cls.query.filter_by(user=email).all()