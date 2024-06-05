# Libraries
from flask import session, Blueprint, request
import datetime

# Local dependencies
from app.db import User, Suspension
from app.authentication import permissions_required

# Initialize
router = Blueprint("user_management", __name__)
# All routes under user_management would be  /api/admin/user_management/*

@router.route("/suspend_user", methods=["POST"])
@permissions_required(is_admin=True)
def suspend_user() -> dict[str, int|str]:
	json = request.get_json()
	email = json["email"]
	duration = int(json["duration"])
	reason = json["reason"]
	start_date = datetime.date.today()
	end_date = start_date + datetime.timedelta(days=duration)
	result = Suspension.createSuspension(email=email, reason=reason, start=start_date, end=end_date)
	if not result:
		return {"status_code": 400, "message": "Fail to suspend user."}
	return {"status_code": 200, "message": end_date.strftime("%Y-%m-%d")}

	
	