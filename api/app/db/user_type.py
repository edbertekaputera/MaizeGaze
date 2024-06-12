# Libraries
from flask import current_app
from typing_extensions import Self 

from .sqlalchemy import db

# User Schema
class TypeOfUser(db.Model):
	__tablename__ = "TypeOfUser"
	name = db.Column(db.String(250), nullable=False, primary_key=True)
	detection_quota_limit = db.Column(db.Integer(), nullable=False)
	storage_limit = db.Column(db.Integer(), nullable=False)
	is_admin = db.Column(db.Boolean(), default=False)

	# Relationship
	typeOfUserToUserRel = db.relationship("User", back_populates="userToTypeOfUserRel", cascade="all, delete, save-update",
									foreign_keys="User.user_type")
	
	@classmethod
	def get(cls, name:str) -> Self|None:
		return cls.query.filter_by(name=name).one_or_none()
	
	@classmethod
	def queryAll(cls) -> list[Self]:
		return cls.query.all()