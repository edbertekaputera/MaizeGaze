# Libraries
from typing_extensions import Self # type: ignore
from flask import current_app

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
	
	@classmethod
	def get(cls, user, name) -> Self | None:
		return cls.query.filter_by(name=name, user=user).one_or_none()

	@classmethod
	def create_farm(cls, details:dict) -> bool:
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
	def update_farm(cls, details:dict[str,str|int|bool]) -> bool:
		try:
			with current_app.app_context():
				farm = cls.get(user=details["user"], name=details["name"])
				if not farm:
					return False
				if details.get("city"):
					farm.city = str(details["city"])
				if details.get("country"):
					farm.country = str(details["country"])
				if details.get("address"):
					farm.address = str(details["address"])
				if details.get("description"):
					farm.description = str(details["description"])
				db.session.commit()
			return True
		except:
			return False		
	
	@classmethod
	def delete_farm(cls, email:str, farm_name:str) -> bool:
		try:
			with current_app.app_context():
				farm = cls.get(user=email, name=farm_name)
				if not farm:
					return False
				db.session.delete(farm)
				db.session.commit()
			return True
		except:
			return False	