# Libraries
from flask import session, Blueprint
import requests
# Local dependencies
from app.db import TypeOfUser, User
from app.authentication import roles_required

# Initialize
router = Blueprint("main", __name__)

@router.route('/test')
def test():
	return {'data': 'test success'}

@router.route('/test_user')
@roles_required(*TypeOfUser.all_users())
def test_user():
	if 'email' in session:
		user = User.get(session['email'])
		if user:
			return {'data': {
				'name': user.name,
				'email': user.email,
			}}
	return 'Hello! Log in with your Google account: <a href="/authentication/login/google">Log in</a><br>Hello! Log in with your Github account: <a href="/authentication/login/github">Log in</a>'
