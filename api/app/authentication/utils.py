# Libraries
from flask import session
from functools import wraps
# Local dependencies
from app.db import User, Suspension

# Require-login route wrapper
def login_required(function):
	'''Function wrapper for login-protected routes'''
	@wraps(function)
	def wrapper(*args, **kwargs):
		if not session.get("email"):
			return {"status_code" : 401, 'message' : 'Unauthorized Access'}
		return function(*args, **kwargs)
	return wrapper

# Verified User-specific route wrapper
def permissions_required(is_admin=False, 
						 is_user=False, 
						 can_reannotate=False, 
						 can_chatbot=False, 
						 can_active_learn=False, 
						 can_diagnose=False):
	
	'''Function wrapper for verified role-protected routes'''
	def check_if_user_suspended(user:User) -> bool:
		suspension = Suspension.getOngoingSuspension(user.email)
		if not suspension:
			return False
		return True
	
	def decorator(function):
		@wraps(function)
		@login_required
		def wrapper(*args, **kwargs):
			current_user = User.get(session["email"])
			if not current_user:
				return {"status_code" : 401, 'message' : 'Unauthorized Access'}
			if not current_user.email_is_verified:
				return {"status_code" : 401, 'message' : 'Unverified Email'}
			if check_if_user_suspended(current_user):
				return {"status_code" : 401, 'message' : 'Suspended Account'}
			if (is_admin and (not session['is_admin'])):
				return {"status_code" : 401, 'message' : 'Unauthorized Access'}
			if (is_user and (session['is_admin'])):
				return {"status_code" : 401, 'message' : 'Unauthorized Access'}
			if (can_chatbot and (not session['can_chatbot'])):
				return {"status_code" : 401, 'message' : 'Unauthorized Access'}
			if (can_reannotate and (not session['can_reannotate'])):
				return {"status_code" : 401, 'message' : 'Unauthorized Access'}
			if (can_active_learn and (not session['can_active_learn'])):
				return {"status_code" : 401, 'message' : 'Unauthorized Access'}
			if (can_diagnose and (not session['can_diagnose'])):
				return {"status_code" : 401, 'message' : 'Unauthorized Access'}
			return function(*args, **kwargs)
		return wrapper
	return decorator