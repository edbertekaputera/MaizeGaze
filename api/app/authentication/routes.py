# Libraries
from flask import session, request, current_app, Blueprint
from flask_bcrypt import Bcrypt
# Local dependencies
from app.db import User, TypeOfUser,  Suspension
from .email import generate_token_from_email, extract_email_from_token, send_email
from .utils import login_required

# Initialize
bcrypt = Bcrypt()  # Used to hash passwords
router = Blueprint("authentication", __name__)
# Note: All routes here will have a prefix of /api/authentication

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
	user = User.register_new_user(email, name, hashed_password)
	if not user:
		return {'status_code' : 409, 'message' : 'email are already registered'}
	print("test")
	# Get Type
	user_type = TypeOfUser.get(user.user_type)
	if not user_type:
		return {'status_code' : 409, 'message' : 'Error occured!'}
	print("test2")

	# Send Email verification
	token = generate_token_from_email(email)
	send_email(
		to=email,
		subject="MaizeGaze Email Verification",
		html=f"""
		Hello {name}! Thank you for registering a new account in our website..<br/>
		Before you start using our services, please activate your account by verifying this email...<br/><br/>
		<a href='{current_app.config["CLIENT_SERVER_URL"]}/activate_account/{token}'>Activate Account</a>
		"""
	)
	print("test3")

	# Regenerate session key after login
	current_app.session_interface.regenerate(session) # type: ignore
	print("test4")
	session["email"] = email
	session["type"] = user_type.name
	session["is_admin"] = user_type.is_admin
	session["detection_quota_limit"] = user_type.detection_quota_limit
	session["storage_limit"] = user_type.storage_limit
	print("test5")

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
		<a href='{current_app.config["CLIENT_SERVER_URL"]}/activate_account/{token}'>Activate Account</a>
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
	# Get Type
	user_type = TypeOfUser.get(user.user_type)
	if not user_type:
		return {'status_code' : 401, 'message' : 'Email or password incorrect'}

	# Regenerate session key after login
	current_app.session_interface.regenerate(session) # type: ignore
	session["email"] = email
	session["type"] = user_type.name
	session["is_admin"] = user_type.is_admin
	session["detection_quota_limit"] = user_type.detection_quota_limit
	session["storage_limit"] = user_type.storage_limit
	session["can_reannotate"] = user_type.can_reannotate
	session["can_active_learn"] = user_type.can_active_learn
	session["can_chatbot"] = user_type.can_chatbot

	return {'status_code' : 202, 'message' : 'User authorized', 'is_admin': user_type.is_admin}

# Logout Route
@router.route('/logout', methods=['POST'])
@login_required
def logout():
	"""Route to logout; clears user session."""
	session.clear()
	return {'status_code' : 200, 'message' : 'User logged out'}

# Identity Route
@router.route("/whoami", methods=['GET'])
@login_required
def whoami():
	if 'email' in session:
		current_user = User.get(session["email"])
		if current_user:
			suspension = Suspension.getOngoingSuspension(session["email"])
			return {
				'status_code': 200, 
				'data': {
					'email': current_user.email,
					'name': current_user.name,
					'activated': current_user.email_is_verified,
					'type': session['type'],
					'is_admin': session['is_admin'],
					'detection_quota_limit': session['detection_quota_limit'],
					'storage_limit': session['storage_limit'],
					'suspended': True if suspension else False
			}}
	return {'status_code': 200, "data": {'type': "anonymous"}}

# Check exist email Route
@router.route("/check_exist_email/<email>", methods=['GET'])
def check_exist_email(email:str):
	""""""
	if email.strip() == "":
		return {'status_code': 400, "message": "Bad request."}
	
	current_user = User.get(email)
	if current_user:
		return {'status_code': 200, "value": True}
	return {'status_code': 200, "value": False}

# Initialize reset password route
@router.route('/init_reset_password', methods=['POST'])
def init_reset_password() -> dict[str, str|int]:
	"""
	Route to initialize a reset password; Takes in arguments through json:
		- email:str, 
	"""
	email = request.get_json()["email"]
	user = User.get(email)
	if not user:
		return {'status_code' : 400, 'message' : 'Invalid email'}
	if not user.email_is_verified:
		return {'status_code' : 401, 'message' : 'Please activate your account first.'}
	
	# Send Email verification
	token = generate_token_from_email(user.email)

	send_email(
		to=user.email,
		subject="MaizeGaze Reset Password",
		html=f"""
		Hello {user.name}! It seems you have requested for a Password Reset...<br/>
		If this was not you, then please do NOT proceed. <br/>
		If you want to proceed, then please click the link below...<br/><br/>
		<a href='{current_app.config["CLIENT_SERVER_URL"]}/new_password/{token}'>Reset Password</a>
		"""
	)
	return {'status_code' : 200, 'message' : 'Reset password email has been sent.'}


# Verify Token Route
@router.route('/verify_token', methods=['GET'])
def verify_token() -> dict[str, bool|str]:
	"""
	Route to verify a token; Takes in arguments through args:
		- token:str, 
	"""
	token = request.args.get("token")
	extracted_email = extract_email_from_token(token)
	if not extracted_email:
		return {'valid' : False, 'message' : 'Invalid Token'} 
	return {'valid' : True, 'message' : 'Valid Token'} 

# Reset Email Route
@router.route('/update_password', methods=['POST'])
def update_password() -> dict[str, str|int|bool]:
	"""
	Route to update an account's password; Takes in arguments through json:
		- token:str, 
		- password:str
	returns bool
	"""
	json = request.get_json()
	token = json['token']
	password = json['password']
	extracted_email = extract_email_from_token(token)
	if not extracted_email:
		return {'success' : False, 'message' : 'Invalid Token.'} 
	hashed_password = bcrypt.generate_password_hash(password)
	success = User.update_password(extracted_email, hashed_password)
	if not success:
		return {'success' : False, 'message' : 'Failed to update password.'} 
	return {'success' : True, 'message' : 'Password is successfully updated!'} 
