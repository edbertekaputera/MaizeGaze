# Libraries
from flask_oauthlib.client import OAuth
from flask_cors import cross_origin
from flask import session, redirect, request, abort, current_app, Blueprint

# Local dependencies
from app.db import User, TypeOfUser, db

# Initialize
oauth = OAuth() # Used for remote app authentication
router = Blueprint("oauth", __name__)
# Note: All routes here will have a prefix of /api/authentication/oauth

# Google authentication
google = oauth.remote_app(
    'google',
	app_key="GOOGLE_AUTH"
)

# GitHub authentication
github = oauth.remote_app(
    'github',
	app_key="GITHUB_AUTH"
)

# Token getter
@google.tokengetter
def get_google_oauth_token():
    return session.get('google_token')

@github.tokengetter
def get_github_oauth_token():
    return session.get('github_token')

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
		return google.authorize(callback=current_app.config["GOOGLE_AUTH"]["redirect_uri"])
	elif provider == "github":
		return github.authorize(callback=current_app.config["GITHUB_AUTH"]["redirect_uri"])
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
		response = google.authorized_response()
		if response is None or response.get('access_token') is None:
			return redirect(current_app.config["CLIENT_SERVER_URL"] + "/login")
		session['google_token'] = (response.get('access_token'), '')

		# Extract email and name
		userinfo = google.get('userinfo').data
		email = userinfo.get("email") # type: ignore
		name = userinfo.get("name") # type: ignore

	# GitHub provider
	if provider == "github":
		response = github.authorized_response()
		if response is None or response.get('access_token') is None:
			return redirect(current_app.config["CLIENT_SERVER_URL"] + "/login")
		session['github_token'] = (response.get('access_token'), '')

		# Extract first verified email and name
		name:str = github.get("user").data.get("name") # type: ignore
		list_of_emails = github.get("user/emails").data
		has_verified_email = False
		# Iterate through emails and find verified
		for e in list_of_emails:
			if e["verified"]: # type: ignore
				email:str = e["email"] # type: ignore
				has_verified_email = True
				break
		# No verified emails flag
		if not has_verified_email:
			return 'Github Account does not have verified email. Login failed.'

	# If its a new user, then register as a new free user.
	User.register_new_user(email, name, email_is_verified=True)

	session['email'] = email
	return redirect(current_app.config["CLIENT_SERVER_URL"])
