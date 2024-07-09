# Libraries
from flask import session, Blueprint, request, jsonify, session

# Local dependencies
from app.db import Suspension
from app.authentication import login_required, permissions_required, bcrypt
from app.db import User
from app.db import TypeOfUser

# Initialize
router = Blueprint("user", __name__)
# All routes under user would be  /api/user/*

@router.route("/get_suspension", methods=["GET"])
@login_required
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

@router.route("/update_profile", methods=["PATCH"])
@permissions_required(is_user=True)
def update_profile() -> dict[str, int|str]:
    details = request.get_json()
    details["email"] = session["email"]
    success = User.update(details=details)
    if not success:
        return {"status_code": 400, "message": f"Failed to update profile '{details['email']}'."}
    return {"status_code": 200, "message": f"Successfully updated profile '{details['email']}'."}

@router.route("/update_password", methods=["PATCH"])
@permissions_required(is_user=True)
def update_password() -> dict[str, str|int|bool]:
    json = request.get_json()
    email = session["email"]
    #current_password = json["current_password"]
    new_password = json["new_password"]
    
    user = User.get(email=email)
    if not user:
        return {"status_code": 400, "message": "User not found."}
    
    # if not bcrypt.check_password_hash(pw_hash=user.password, password=current_password):
    #     return {"status_code": 400, "message": "Current password incorrect"}
    
    hashed_password = bcrypt.generate_password_hash(new_password)
    
    success = User.update_password(email, hashed_password)
    if not success:
        return {"status_code": 400, "message": "Failed to update password."}
    return {"status_code": 200, "message": "Password is successfully updated!"}

@router.route("/plan_management", methods=["GET"])
@permissions_required(is_user=True)
def plan_management() -> dict[str, str|int|bool]:
    name = request.args["name"]
    email = session["email"]
    tier = TypeOfUser.get(name)
    
    user = User.get(email)
    if not user:
        return {"message": "User not found."}
    user_type = user.user_type
    
    if not tier:
        return {"message": f"Tier '{name}' not found."}
    
    return {
        "name": tier.name,
        "detection_quota_limit": tier.detection_quota_limit,
        "storage_limit": tier.storage_limit,
        "price": tier.price,
        "can_reannotate": tier.can_reannotate,
        "can_chatbot": tier.can_chatbot,
        "can_active_learn": tier.can_active_learn,
        "user_type": user_type,
        "can_diagnose": tier.can_diagnose
    }

# @router.route("/cancel_plan", methods=["PATCH"])
# @permissions_required(is_user=True)
# def create_cancel_plan() -> dict[str, str]:
#     email = session["email"]
#     user = User.get(email)

#     if not user:
#         return {"status_code": 400, "message": "User not found."}
    
#     if user.user_type == "FREE_USER":
#         return {"status_code": 400, "message": "User is already on free tier."}
    
#     success = User.update({"email": email, "user_type": "FREE_USER"})
#     if not success:
#         return {"status_code": 400, "message": "Failed to cancel plan."}
#     return {
#         "status_code": 200, 
#         "message": "Successfully canceled plan."
#     }
    
@router.route("/get_user_type", methods=["GET"])
@permissions_required(is_user=True)
def get_user_type() -> dict[str, str]:
    email = session["email"]
    user = User.get(email)
    if not user:
        return {"message": "User not found."}
    
    user_type = user.user_type
    tier = TypeOfUser.get(user_type)
    
    if not tier:
        return {"message": "Tier not found."}
    
    return {
        "tier": tier.name,
        "detection_quota_limit": tier.detection_quota_limit,
        "storage_limit": tier.storage_limit,
        "can_reannotate": tier.can_reannotate,
        "can_chatbot": tier.can_chatbot,
        "can_active_learn": tier.can_active_learn,
        "can_diagnose": tier.can_diagnose
    }