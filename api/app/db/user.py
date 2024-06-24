# Libraries
from flask import current_app
from typing_extensions import Self # type: ignore

from .sqlalchemy import db
from .farm import Farm


# User Schema
class User(db.Model):
	__tablename__ = "User"
	email = db.Column(db.String(250), nullable=False, primary_key=True)
	name = db.Column(db.String(250), nullable=False)
	email_is_verified = db.Column(db.Boolean(), default=False)
	password = db.Column(db.String(250))

	# Foreign key
	user_type = db.Column(db.String(250), db.ForeignKey("TypeOfUser.name"), nullable=False)
	userToTypeOfUserRel = db.relationship("TypeOfUser", back_populates="typeOfUserToUserRel", cascade="all, delete, save-update",
									foreign_keys="User.user_type")
	# Other Relationship
	userToDetectionQuotaRel = db.relationship("DetectionQuota", back_populates="detectionQuotaToUserRel", cascade="all, delete, save-update",
									foreign_keys="DetectionQuota.user")
	userToFarmRel = db.relationship("Farm", back_populates="farmToUserRel", cascade="all, delete, save-update",
									foreign_keys="Farm.user")
	userToSuspensionRel = db.relationship("Suspension", back_populates="suspensionToUserRel", cascade='all, delete, save-update',
								  foreign_keys="Suspension.user")
	
	@classmethod
	def get(cls, email:str) -> Self|None:
		return cls.query.filter_by(email=email).one_or_none()
	
	@classmethod
	def query_all_users(cls) -> list[Self]:
		return cls.query.all()

	@classmethod
	def register_new_user(cls, email:str, name:str, hashed_password:bytes|None=None, email_is_verified:bool|None=None) -> Self | None:
		# Check whether email is already in the database (must be unique)
		email_in_database = cls.get(email)
		if email_in_database:
			return None
		# If register is successful, create new user
		new_user = cls(
			email=email,
			name=name,
			user_type="FREE_USER",
			password=hashed_password,
			email_is_verified=email_is_verified
		) # type: ignore
		
		# TEMPORARY only for hardcoded FARM
		temp_farm = Farm(name="Corn Farm", city="city",address="test address", country="country", land_size=1000, user=email) # type: ignore
		
		with current_app.app_context():
			db.session.add(new_user)
			db.session.add(temp_farm)
			db.session.commit()
		
		inputted_user = cls.get(email)
		return inputted_user
	
	@classmethod
	def activate_new_user(cls, token_email:str, session_email:str) -> dict[str, str|int]:
		with current_app.app_context():
			current_user = User.get(session_email)
			if not current_user:
				return {'status_code' : 400, 'message' : 'Invalid Token'}
			if current_user.email_is_verified:
					return {'status_code' : 200, 'message' : 'User account is already activated'}
			if current_user.email == token_email:
				current_user.email_is_verified = True
				db.session.commit()
				return {'status_code' : 200, 'message' : 'User account is activated'}
		return {'status_code' : 400, 'message' : 'Invalid Token'}

	@classmethod
	def update_password(cls, email:str, new_hashed_password:bytes) -> bool:
		with current_app.app_context():
			current_user = User.get(email)
			if not current_user:
				return False
			current_user.password = new_hashed_password
			db.session.commit()
			return True
	
	@classmethod
	def getNumOfUserByTier(cls, tier_name:str) -> int:
		return cls.query.filter_by(user_type=tier_name).count()
	
	@classmethod
	def update(cls, details:dict[str, str|bytes]) -> bool:
		try:
			with current_app.app_context():
				current_user = User.get(str(details["email"]))
				if not current_user:
					return False
				# Name
				new_name = details.get("name")
				if new_name and new_name != current_user.name:
					if new_name.strip() == "":
						return False
					current_user.name = new_name
				# Password
				new_hashed_password = details.get("hashed_password")
				if new_hashed_password:
					current_user.password = new_hashed_password
				db.session.commit()
				return True
		except:
			return False
