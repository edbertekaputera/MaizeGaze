# Libraries
from flask import current_app
from datetime import datetime
from typing_extensions import Self

# Local dependencies
from .sqlalchemy import db
from .user import User

# Suspension Schema
class Suspension(db.Model):
	__tablename__ = "Suspension"
	# attributes
	start = db.Column(db.DateTime(), nullable=False, primary_key=True)
	end = db.Column(db.DateTime())
	reason = db.Column(db.String(250), nullable=False)

	# Part of composite key (qualifier)
	user = db.Column(db.String(250), db.ForeignKey('User.email'), nullable=False, primary_key=True)
	suspensionToUserRel = db.relationship("User", back_populates="userToSuspensionRel",
								  foreign_keys="Suspension.user")
	
	@classmethod
	def createSuspension(cls, email:str, reason:str, start:datetime|None=None, end:datetime|None=None) -> bool:
		"""
		Creates a new Suspension by passing arguments:
			- email:str, 
			- reason:str, 
			- start:date=None, 
			- end:date=None
		returns bool.
		"""
		try:
			# Default value management
			if not start:
				start = datetime.now()
			# Invalid Dates
			if end and end < start:
				return False
			
			# Check if suspension already exist
			if cls.query.filter_by(user=email, start=start).one_or_none():
				return False
			
			# Initialize new suspension
			new_suspension = cls(user=email, start=start, end=end, reason=reason) # type: ignore

			# Commit to DB
			with current_app.app_context():
				db.session.add(new_suspension)
				db.session.commit()
			return True
		
		except:
			return False
		
	@classmethod
	def getOngoingSuspension(cls, email:str) -> Self|None:
		"""
		Get an ongoing suspension of a user by passing arguments:
			- email:str
		returns bool.
		"""
		all_ongoing_suspensions = cls.query.filter(cls.user == email, cls.start <= datetime.now(), cls.end is None or cls.end >= datetime.now()).all() # type: ignore
		if len(all_ongoing_suspensions) == 0:
			return None

		last_suspension = all_ongoing_suspensions[0]
		if last_suspension.end is None:
			return last_suspension
		for suspension in all_ongoing_suspensions[1:]:
			if suspension.end is None:
				return suspension
			if suspension.end > last_suspension.end:
				last_suspension = suspension
		return last_suspension