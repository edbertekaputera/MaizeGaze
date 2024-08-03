# Libraries
from flask import current_app
from typing_extensions import Self # type: ignore
from datetime import date

# Local dependencies
from .sqlalchemy import db


# Views Schema
class DiagnosisQuota(db.Model):
	__tablename__ = "DiagnosisQuota"
	# attributes
	month = db.Column(db.Integer(), nullable=False, primary_key=True)
	year = db.Column(db.Integer(), nullable=False, primary_key=True)
	quota = db.Column(db.Integer(), default=0)

	# Part of composite key (qualifier)
	user = db.Column(db.String(250), db.ForeignKey("User.email"), nullable=False, primary_key=True)
	diagnosisQuotaToUserRel = db.relationship("User", back_populates="userToDiagnosisQuotaRel",
									foreign_keys="DiagnosisQuota.user")
 
	@classmethod
	def get(cls, user_email:str, month:int, year:int) -> Self|None:
		"""
		Queries Diagnosis Quota for a specified user on a specific month, takes in arguments:
			- user_email:str, 
			- month:int, 
			- year:int
		returns a DiagnosisQuota instance.
		"""
		return cls.query.filter_by(user=user_email, month=month, year=year).one_or_none()

	@classmethod
	def increment_quota(cls, email:str) -> bool:
		with current_app.app_context():
			today = date.today()
			diagnosis_quota = cls.get(email, today.month, today.year)
			# if quota for a user at a certain time doesn't exist, create new quota record
			if not diagnosis_quota:
				newViews = cls(user=email, month=today.month, year=today.year, quota=1) # type: ignore
				db.session.add(newViews)
			# else increment views by 1
			else:
				if diagnosis_quota.quota >= current_app.config["DIAGNOSIS_QUOTA_LIMIT"]:
					return False
				diagnosis_quota.quota = diagnosis_quota.quota + 1
			db.session.commit()
		return True
	
	@classmethod
	def query_total_diagnosis(cls, email:str) -> int:
		total = db.session.query(db.func.sum(cls.quota)).filter_by(user=email).scalar()
		return total if total is not None else 0