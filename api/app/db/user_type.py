# Libraries
from flask import current_app
from typing_extensions import Self 

from .sqlalchemy import db
from .user import User

# User Schema
class TypeOfUser(db.Model):
	__tablename__ = "TypeOfUser"
	name = db.Column(db.String(250), nullable=False, primary_key=True)
	detection_quota_limit = db.Column(db.Integer(), nullable=False)
	storage_limit = db.Column(db.Integer(), nullable=False)
	is_admin = db.Column(db.Boolean(), default=False)
	price =  db.Column(db.Float(), nullable=False)
	can_reannotate = db.Column(db.Boolean(), default=False)
	can_chatbot = db.Column(db.Boolean(), default=False)
	can_active_learn = db.Column(db.Boolean(), default=False)

	# Relationship
	typeOfUserToUserRel = db.relationship("User", back_populates="userToTypeOfUserRel", cascade="all, delete, save-update",
									foreign_keys="User.user_type")
	
	@classmethod
	def get(cls, name:str) -> Self|None:
		return cls.query.filter_by(name=name).one_or_none()
	
	@classmethod
	def queryAll(cls) -> list[Self]:
		return cls.query.all()
	
	@classmethod
	def createTypeOfUser(cls, details:dict[str,str|int|bool]) -> bool:
		"""Create a new type of user.

		Args:
			details (dict[str,str | int | bool]):
				- name:str,
				- detection_quota_limit:int,
				- storage_limit:int,
				- is_admin:bool,
				- price:float,
				- can_reannotate:bool,
				- can_chatbot:bool,
				- can_active_learn:bool,

		Returns:
			bool: successful creation or not.
		"""
		try:
			with current_app.app_context():
				new_tier = cls(**details)
				# Cannot make admin tier
				if new_tier.is_admin:
					return False
				# Exists already or has invalid numerical features
				if cls.get(new_tier.name) or new_tier.price <= 0 or new_tier.detection_quota_limit <= 0 or new_tier.storage_limit <=0:
					return False
				db.session.add(new_tier)
				db.session.commit()
			return True
		except:
			return False
	
	@classmethod
	def updateTypeOfUser(cls, details:dict[str,str|int|bool]) -> bool:
		"""Update a type of user.

		Args:
			details (dict[str,str | int | bool]):
				- name:str,
				- detection_quota_limit:int = None,
				- storage_limit:int = None,
				- price:float = None,
				- can_reannotate:bool = None,
				- can_chatbot:bool = None,
				- can_active_learn:bool = None

		Returns:
			bool: successful update or not.
		"""
		try:
			with current_app.app_context():
				tier = cls.get(str(details["name"]))
				if not tier:
					return False
				if details.get("detection_quota_limit") and int(details["detection_quota_limit"]) > 0:
					tier.detection_quota_limit = int(details["detection_quota_limit"])
				if details.get("storage_limit") and int(details["storage_limit"]) > 0:
					tier.storage_limit = int(details["storage_limit"])
				if details.get("price") and float(details["price"]) > 0:
					tier.price = float(details["price"])
				if details.get("can_reannotate") is not None:
					tier.can_reannotate = bool(details["can_reannotate"])
				if details.get("can_chatbot") is not None:
					tier.can_chatbot = bool(details["can_chatbot"])
				if details.get("can_active_learn") is not None:
					tier.can_active_learn = bool(details["can_active_learn"])
				db.session.commit()
			return True
		except:
			return False		
	
	@classmethod
	def delete(cls, name:str) -> bool:
		"""Deletes a type of user.

		Args:
			name:str

		Returns:
			bool: successful update or not.
		"""
		try:
			with current_app.app_context():
				tier = cls.get(name)
				if not tier:
					return False
				db.session.delete(tier)
				db.session.commit()
			return True
		except:
			return False		