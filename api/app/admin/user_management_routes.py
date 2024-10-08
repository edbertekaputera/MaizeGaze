# Libraries
from flask import session, Blueprint, request
import datetime

# Local dependencies
from app.db import User, Suspension, TypeOfUser, DetectionQuota, DiagnosisQuota, ConsultationQuota
from app.authentication import permissions_required
from app.storage import UserDirectory

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
	start_date = datetime.datetime.now()
	end_date = start_date + datetime.timedelta(days=duration)
	result = Suspension.createSuspension(email=email, reason=reason, start=start_date, end=end_date)
	if not result:
		return {"status_code": 400, "message": "Fail to suspend user."}
	return {"status_code": 200, "message": end_date.strftime("%Y-%m-%d %H:%M:%S")}

@router.route("/query_user", methods=["GET"])
@permissions_required(is_admin=True)
def queryUser()-> dict[str, int|str|dict[str, str|bool|int|float]]:
	email = request.args["email"]
	user = User.get(email = email)
	if not user:
		return {"status_code": 400, "message": "User not found"}
	userType = TypeOfUser.get(name = user.user_type)
	if not userType:
		return {"status_code": 400, "message": "User Type not found"}

	totalDetections = DetectionQuota.query_total_detection(email = email)
	totalDiagnostics = DiagnosisQuota.query_total_diagnosis(email = email)
	totalConsultations = ConsultationQuota.query_total_consultation(email = email)
	user_directory = UserDirectory(email = email)
	totalSize = user_directory.get_size()

	result_json = {
		"name": user.name,
		"email": user.email,
		"email_is_verified": bool(user.email_is_verified),
		"user_type": userType.name,
		"detection_quota_limit": int(userType.detection_quota_limit),
		"storage_limit": int(userType.storage_limit),
		"is_admin":  bool(userType.is_admin),
		"total_detections": int(totalDetections),
		"total_consultation": int(totalConsultations),
		"total_diagnostics": int(totalDiagnostics),
		"total_size": float(f"{totalSize:.2f}")
	}

	return {"status_code": 200, "result": result_json}

@router.route("/search_users", methods=["GET"])
@permissions_required(is_admin=True)
def searchUsers() -> dict[str, list[dict[str, str|int|bool|list[dict[str, str]]]]]:
	users = User.query_all_users()

	resultList = []

	for user in users:
		suspension = Suspension.getOngoingSuspension(email=user.email)
		if suspension is None:
			suspended_info = None
		else:
			suspended_info = {
				"end_date": suspension.end.strftime("%Y-%m-%d %H:%M:%S"),
				"reason": suspension.reason
			}

		result_json = {
			"email": user.email,
			"name": user.name,
			"email_is_verified": user.email_is_verified,
			"user_type": user.user_type,
			"suspended": suspended_info
		}

		resultList.append(result_json)

	return {"result": resultList}