# Libraries
from flask import session
from functools import wraps
# Local dependencies
from app.db import User, TypeOfUser

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
def permissions_required(is_admin=False, is_user=False):
	'''Function wrapper for verified role-protected routes'''
	def decorator(function):
		@wraps(function)
		@login_required
		def wrapper(*args, **kwargs):
			current_user = User.get(session["email"])
			if not current_user:
				return {"status_code" : 401, 'message' : 'Unauthorized Access'}
			if not current_user.email_is_verified:
				return {"status_code" : 401, 'message' : 'Unverified Email'}
			if (is_admin and (not session['is_admin'])):
				return {"status_code" : 401, 'message' : 'Unauthorized Access'}
			if (is_user and (session['is_admin'])):
				return {"status_code" : 401, 'message' : 'Unauthorized Access'}
			return function(*args, **kwargs)
		return wrapper
	return decorator