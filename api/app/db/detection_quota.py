# Libraries
from flask import current_app
from typing_extensions import Self # type: ignore
from datetime import date

# Local dependencies
from .sqlalchemy import db

# Views Schema
class DetectionQuota(db.Model):
	__tablename__ = "DetectionQuota"
	# attributes
	month = db.Column(db.Integer(), nullable=False, primary_key=True)
	year = db.Column(db.Integer(), nullable=False, primary_key=True)
	quota = db.Column(db.Integer(), default=0)

	# Part of composite key (qualifier)
	user = db.Column(db.String(250), db.ForeignKey("User.email"), nullable=False, primary_key=True)
	detectionQuotaToUserRel = db.relationship("User", back_populates="userToDetectionQuotaRel",
									foreign_keys="DetectionQuota.user")
 
	@classmethod
	def get(cls, user_email:str, month:int, year:int) -> Self|None:
		"""
		Queries Detection Quota for a specified user on a specific month, takes in arguments:
			- user_email:str, 
			- month:int, 
			- year:int
		returns a DetectionQuota instance.
		"""
		return cls.query.filter_by(user=user_email, month=month, year=year).one_or_none()

	@classmethod
	def increment_quota(cls, email:str, limit:int) -> bool:
		with current_app.app_context():
			today = date.today()
			detection_quota = cls.get(email, today.month, today.year)
			# if quota for a user at a certain time doesn't exist, create new quota record
			if not detection_quota:
				newViews = cls(user=email, month=today.month, year=today.year, quota=1) # type: ignore
				db.session.add(newViews)
			# else increment views by 1
			else:
				if detection_quota.quota >= limit:
					return False
				detection_quota.quota = detection_quota.quota + 1
			db.session.commit()
		return True
	
	@classmethod
	def query_total_detection(cls, email:str) -> int:

		total = db.session.query(db.func.sum(cls.quota)).filter_by(user=email).scalar()
		
		return total if total is not None else 0