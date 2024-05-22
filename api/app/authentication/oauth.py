# Libraries
from authlib.integrations.flask_client import OAuth
from flask_cors import cross_origin
from flask import session, redirect, abort, current_app, Blueprint

# Local dependencies
from app.db import User, TypeOfUser

# Initialize
oauth = OAuth() # Used for remote app authentication
router = Blueprint("oauth", __name__)
# Note: All routes here will have a prefix of /api/authentication/oauth

# Token getter
def get_google_oauth_token():
    return session.get('google_token')
def get_github_oauth_token():
    return session.get('github_token')

# Google authentication
google = oauth.register(
	'google',
	api_base_url= 'https://www.googleapis.com/oauth2/v1/',
	request_token_url= None,
	access_token_url= 'https://accounts.google.com/o/oauth2/token',
	authorize_url= 'https://accounts.google.com/o/oauth2/auth',
	fetch_token=get_google_oauth_token,
	client_kwargs={'scope': 'profile email'}
) 

# GitHub authentication
github = oauth.register(
	'github',
	api_base_url= 'https://api.github.com/',
	request_token_url= None,
	access_token_url= 'https://github.com/login/oauth/access_token',
	authorize_url= 'https://github.com/login/oauth/authorize',
	fetch_token=get_github_oauth_token,
	client_kwargs={'scope': 'user:email'}
) 

# Authorized Remote Login Route
@router.route('/test', methods=["GET"])
def test():
	return {"data": "success"}

# Authorized Remote Login Route
@router.route('/login/<provider>', methods=["GET"])
def remote_login(provider:str):
	"""
	Route to login using different providers; Takes in arguments
		- provider:str['google', 'github']
	"""
	if provider == "google":
		return google.authorize_redirect(current_app.config["GOOGLE_REDIRECT_URI"]) # type: ignore
	elif provider == "github":
		return github.authorize_redirect(current_app.config["GITHUB_REDIRECT_URI"]) # type: ignore
	return abort(404)

# Authorized Remote Login Callback
@router.route('/login/<provider>/authorized', methods=["GET"])
@cross_origin()
def authorized(provider:str):
	"""
	Authorized redirected route for remote party authentication;
		- provider:str['google', 'github']
	"""
	
	# Regenerate session key after login
	current_app.session_interface.regenerate(session) # type: ignore
	
	# Google provider
	if provider == "google":
		token = google.authorize_access_token() # type: ignore
		if token is None or token.get('access_token') is None:
			return redirect(current_app.config["CLIENT_SERVER_URL"] + "/login")
		session['google_token'] = token["access_token"]
		# Extract email and name
		resp = google.get('userinfo') # type: ignore
		resp.raise_for_status()
		userinfo = resp.json()
		email = userinfo.get("email") 
		name = userinfo.get("name")

	# GitHub provider
	if provider == "github":
		token = github.authorize_access_token() # type: ignore
		if token is None or token.get('access_token') is None:
			return redirect(current_app.config["CLIENT_SERVER_URL"] + "/login")
		session['github_token'] = token["access_token"]
		# Extract first verified email and name
		resp = github.get('user') # type: ignore
		resp.raise_for_status()
		name = resp.json().get("name")
		email_resp = github.get('user/emails') # type: ignore
		email_resp.raise_for_status()
		list_of_emails = email_resp.json()
		has_verified_email = False

		# Iterate through emails and find verified
		for e in list_of_emails:
			if e["verified"]: 
				email = e["email"]
				has_verified_email = True
				break
		# No verified emails flag
		if not has_verified_email:
			return 'Github Account does not have verified email. Login failed.'

	# If its a new user, then register as a new free user.
	user = User.register_new_user(email, name, email_is_verified=True)
	if not user:
		user = User.get(email)
	if not user:
		abort(500)
		
	# Get Type
	user_type = TypeOfUser.get(user.user_type)
	if not user_type:
		return redirect(current_app.config["CLIENT_SERVER_URL"] + "/login")
	
	session['email'] = email
	session["type"] = user_type.name
	session["is_admin"] = user_type.is_admin
	session["detection_quota_limit"] = user_type.detection_quota_limit
	session["storage_limit"] = user_type.storage_limit
	return redirect(current_app.config["CLIENT_SERVER_URL"])
