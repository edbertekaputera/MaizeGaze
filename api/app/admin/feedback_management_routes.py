# Libraries
from flask import session, Blueprint, request
from datetime import datetime


# Local dependencies
from app.db import User, Feedback
from app.authentication import permissions_required
from app.storage import UserDirectory

# Initialize
router = Blueprint("feedback_management", __name__)
# All routes under user_management would be  /api/admin/feedback_management/*


@router.route("/query_all_feedbacks", methods=["GET"])
@permissions_required(is_admin=True)
def query_all_feedbacks() -> dict[str, int|str|list[dict[str, str|int|bool]]]:
    feedbacks = Feedback.query_all_feedback()
    list_of_feedbacks = []
    
    for feedback in feedbacks:
        user = User.get(email=feedback.user_email)
        if user and not user.userToTypeOfUserRel.is_admin:
            list_of_feedbacks.append({
                "feedback_id": feedback.feedback_id,
                "user_email": feedback.user_email,
                "rating": feedback.rating,
                "content": feedback.content,
                "created_at": feedback.created_at.isoformat() if feedback.created_at else None
            })
    
    return {"status_code": 200, "feedbacks": list_of_feedbacks}

@router.route("/query_feedback", methods=["GET"])
@permissions_required(is_admin=True)
def query_feedback() -> dict[str, int|str|dict[str, str|int|bool]]:
    feedback_id = request.args.get('feedback_id')    
    if not feedback_id:
        return {
            "status_code": 400,
            "message": "Feedback ID is required."
        }, 400
    feedback = Feedback.get(feedback_id)
    if not feedback:
        return {
            "status_code": 404,
            "message": f"Feedback with ID '{feedback_id}' not found."
        }, 404
    user = User.get(email=feedback.user_email)
    if user and not user.userToTypeOfUserRel.is_admin:
        return {
            "status_code": 200,
            "feedback": {
                "feedback_id": feedback.feedback_id,
                "user_email": feedback.user_email,
                "rating": feedback.rating,
                "content": feedback.content,
                "created_at": feedback.created_at.isoformat() if feedback.created_at else None
            }
        }, 200
    else:
        return {
            "status_code": 403,
            "message": "Access denied or admin feedback."
        }, 403