# Libraries
from flask import session, request, current_app, Blueprint
from flask_bcrypt import Bcrypt
from functools import wraps # type: ignore
# Local dependencies
from app.db import User
from .email import generate_token_from_email, extract_email_from_token, send_email

# Initialize
bcrypt = Bcrypt()  # Used to hash passwords
router = Blueprint("authentication", __name__)
# Note: All routes here will have a prefix of /api/authentication


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
def roles_required(*roles):
	'''Function wrapper for verified role-protected routes'''
	def decorator(function):
		@wraps(function)
		@login_required
		def wrapper(*args, **kwargs):
			current_user = User.get(session["email"])
			if not current_user or current_user.user_type not in set(roles):
				return {"status_code" : 401, 'message' : 'Unauthorized Access'}
			if not current_user.email_is_verified:
				return {"status_code" : 401, 'message' : 'Unverified Email'}
			return function(*args, **kwargs)
		return wrapper
	return decorator

# Register Route
@router.route('/register', methods=['POST'])
def register() -> dict[str, str|int]:
	"""
	Route to registering a new account; Takes in arguments through json:
		- email:str, 
		- name:str, 
		- password:str 
	"""
	json = request.get_json()
	email = json.get("email", None)
	name = json.get("name", None)
	password = json.get("password", None)
	hashed_password = bcrypt.generate_password_hash(password)
	
	# Register account
	success = User.register_new_user(email, name, hashed_password)
	if not success:
		return {'status_code' : 409, 'message' : 'email are already registered'}
	
	# Send Email verification
	token = generate_token_from_email(email)
	send_email(
		to=email,
		subject="MaizeGaze Email Verification",
		html=f"""
		Hello {name}! Thank you for registering a new account in our website..<br/>
		Before you start using our services, please activate your account by verifying this email...<br/><br/>
		<a href='http://localhost:3000/activate_account/{token}'>Activate Account</a>
		"""
	)
	# Regenerate session key after login
	current_app.session_interface.regenerate(session) # type: ignore
	session["email"] = email
	return {'status_code' : 201, 'message' : 'User registered'}

# Resend Email Route
@router.route('/resend_activation_email', methods=['POST'])
@login_required
def resend_activation_email() -> dict[str, str|int]:
	user = User.get(session["email"])
	if not user:
		return {'status_code' : 400, 'message' : 'Invalid email'}
	
	# Send Email verification
	token = generate_token_from_email(user.email)
	send_email(
		to=user.email,
		subject="MaizeGaze Email Verification",
		html=f"""
		Hello {user.name}! Thank you for registering a new account in our website..<br/>
		Before you start using our services, please activate your account by verifying this email...<br/><br/>
		<a href='http://localhost:3000/activate_account/{token}'>Activate Account</a>
		"""
	)
	return {'status_code' : 200, 'message' : 'Activation email has been resent.'}

# Confirm Email Route
@router.route('/activate_email', methods=['POST'])
@login_required
def activate_email() -> dict[str, str|int]:
	"""
	Route to verify an account's email; Takes in arguments through json:
		- token:str, 
	"""
	json = request.get_json()
	token = json.get('token', None)
	extracted_email = extract_email_from_token(token)
	if not extracted_email:
		return {'status_code' : 400, 'message' : 'Invalid Token'} 
	return User.activate_new_user(token_email=extracted_email, session_email=session["email"])
	

# Login route
@router.route('/login', methods=["POST"])
def login():
	"""
	Route to login using email password; Takes in arguments through json form,
		- email:str,
		- password:str
	"""
	json = request.get_json()
	email = json.get("email")
	password = json.get("password")
	user = User.get(email)
	
	# Check if user invalid or if user has setup password
	if not user or not user.password:
		return {'status_code' : 401, 'message' : 'Email or password incorrect'}
	# Check if password is wrong
	if not bcrypt.check_password_hash(pw_hash=user.password, password=password):
		return {'status_code' : 401, 'message' : 'Email or password incorrect'}
	# Regenerate session key after login
	current_app.session_interface.regenerate(session) # type: ignore
	session["email"] = email
	return {'status_code' : 202, 'message' : 'User authorized', 'type': user.user_type}

# Logout Route
@router.route('/logout', methods=['POST'])
@login_required
def logout():
	"""Route to logout; clears user session."""
	session.clear()
	return {'status_code' : 200, 'message' : 'User logged out'}

# Identity Route
@router.route("/whoami", methods=['POST'])
@login_required
def whoami():
	if 'email' in session:
		current_user = User.get(session["email"])
		if current_user:
			return {
				'status_code': 200, 
				'data': {
					'email': current_user.email,
					'name': current_user.name,
					'activated': current_user.email_is_verified,
					'type': current_user.user_type.value
			}}
	return {'status_code': 200, "data": {'type': "anonymous"}}

# Check exist email Route
@router.route("/check_exist_email/<email>", methods=['GET'])
def check_exist_email(email:str):
	if email.strip() == "":
		return {'status_code': 400, "message": "Bad request."}
	
	current_user = User.get(email)
	if current_user:
		return {'status_code': 200, "value": True}
	return {'status_code': 200, "value": False}

