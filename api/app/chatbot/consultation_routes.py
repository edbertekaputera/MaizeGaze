# Libraries
from flask import session, Blueprint, request, current_app
from celery.result import AsyncResult
from base64 import encodebytes
from datetime import date 
# Local dependencies
from app.db import ConsultationQuota
from app.authentication import permissions_required
from .consultation_task import consult_question

# Initialize
router = Blueprint("consultation", __name__)
# All routes under farm would be  /api/chatbot/consultation/*

# Initialize detection task route
@router.route("/init_consultation", methods=["POST"])
@permissions_required(is_user=True, can_chatbot=True)
def init_consultation() -> dict[str, bool|str]:
	# Get question
	question = request.get_json()["question"]
	# Check user
	success = ConsultationQuota.increment_quota(session['email'])
	if not success:
		return {"success": False}
	# Initialize task
	result = consult_question.delay(question) # type: ignore
	return {"success": True, "result_id": result.id}

# Retrieve consultation task results route
@router.route("/get_consultation_result", methods=["GET"])
@permissions_required(is_user=True, can_chatbot=True)
def get_consultation_result() -> dict[str, str]:
	result_id = request.args["result_id"]
	result = AsyncResult(result_id)
	if result.ready():
		# Task has completed
		if result.successful():
			return {
				"status": "SUCCESS",
				"data": result.result
			}
		else:
		# Task completed with an error
			return {
				'status': 'ERROR', 
				'message': str(result.result)
			}
	else:
		# Task is still pending
		return {'status': 'RUNNING'}
	
# Retrieve diagnosis quota route
@router.route("/get_consultation_quota", methods=["GET"])
@permissions_required(is_user=True, can_chatbot=True)
def get_consultation_quota() -> dict[str, int]:
	today = date.today()
	dq = ConsultationQuota.get(user_email=session['email'], month=today.month, year=today.year)
	if not dq:
		return {"quota": current_app.config["CONSULTATION_QUOTA_LIMIT"]}
	return {"quota":  current_app.config["CONSULTATION_QUOTA_LIMIT"] - dq.quota}