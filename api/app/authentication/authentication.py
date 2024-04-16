# Libraries
from flask import session, request, current_app, Blueprint
from flask_bcrypt import Bcrypt
from functools import wraps # type: ignore
# Local dependencies
from app.db import User, TypeOfUser, db
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
			current_user = User.get(session.get("email"))
			if not current_user or current_user.user_type not in set(roles):
				return {"status_code" : 401, 'message' : 'Unauthorized Access'}
			if not current_user.email_is_verified:
				return {"status_code" : 401, 'message' : 'Unverified Email'}
			return function(*args, **kwargs)
		return wrapper
	return decorator

# Register Route
@router.route('/register', methods=['POST'])
def register():
	"""
	Route to registering a new account; Takes in arguments through json:
		- email:str, 
		- name:str, 
		- password:str 
	"""
	email = request.json.get("email", None)
	name = request.json.get("name", None)
	password = request.json.get("password", None)

	# Check whether email is already in the database (must be unique)
	email_in_database = User.get(email)
	if email_in_database:
		return {'status_code' : 409, 'message' : 'email are already registered'}

	# If register is successful, create new user
	new_user = User(
		email=email,
		name=name,
		user_type=TypeOfUser.FREE_USER,
		password=bcrypt.generate_password_hash(password)
	)
	
	with current_app.app_context():
		db.session.add(new_user)
		db.session.commit()

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
	current_app.session_interface.regenerate(session)
	session["email"] = email

	return {'status_code' : 201, 'message' : 'User registered'}

# Resend Email Route
@router.route('/resend_activation_email', methods=['POST'])
@login_required
def resend_activation_email():
	user = User.get(session["email"])
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
def activate_email():
	"""
	Route to verify an account's email; Takes in arguments through json:
		- token:str, 
	"""
	token = request.json.get('token', None)
	email = extract_email_from_token(token)
	with current_app.app_context():
		current_user = User.get(session['email'])
		if current_user.email_is_verified:
				return {'status_code' : 200, 'message' : 'User account is already activated'}
		if current_user.email == email:
			current_user.email_is_verified = True
			db.session.commit()
			return {'status_code' : 200, 'message' : 'User account is activated'}
	return {'status_code' : 400, 'message' : 'Invalid Token'}

# Login route
@router.route('/login', methods=["POST"])
def login():
	"""
	Route to login using email password; Takes in arguments through json form,
		- email:str,
		- password:str
	"""
	email = request.json.get("email", None)
	password = request.json.get("password", None)

	user = User.get(email)
	
	# Check if user invalid or if user has setup password
	if not user or not user.password:
		return {'status_code' : 401, 'message' : 'Email or password incorrect'}
	# Check if password is wrong
	if not bcrypt.check_password_hash(pw_hash=user.password, password=password):
		return {'status_code' : 401, 'message' : 'Email or password incorrect'}

	# Regenerate session key after login
	current_app.session_interface.regenerate(session)

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
		current_user = User.query.filter_by(email=session.get("email")).one_or_none()
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
	
	current_user = User.query.filter_by(email=email).one_or_none()
	if current_user:
		return {'status_code': 200, "value": True}
	return {'status_code': 200, "value": False}

