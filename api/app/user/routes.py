# Libraries
from flask import session, Blueprint

# Local dependencies
from app.db import Suspension
from app.authentication import permissions_required, login_required

# Initialize
router = Blueprint("user", __name__)
# All routes under user would be  /api/user/*

@router.route("/get_suspension", methods=["GET"])
@permissions_required(is_user=True)
def get_suspension() -> dict[str, dict[str,str]|bool]:
		suspension = Suspension.getOngoingSuspension(session["email"])
		if not suspension:
			return {"success": False}

		return {
			"success": True, 
			"data": {
				"end": suspension.end.strftime("%Y-%m-%d %H:%M:%S"),
				"reason": suspension.reason
			}
		}