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
def plan_management() -> dict[str, list[dict[str, str|int|bool]] | str]:
    email = session["email"]
    user = User.get(email)
    if not user:
        return {"message": "User not found."}
    
    user_type = TypeOfUser.queryAll()
    print (user_type)
    
    for user in user_type:
        if user.is_admin:
            user_type.remove(user)
    
    print (user_type)
    
    plans = []
    
    for tier in user_type:
        plans_details = {
            "tier": tier.name,
            "detection_quota_limit": tier.detection_quota_limit,
            "storage_limit": tier.storage_limit,
            "price": tier.price,
            "can_reannotate": tier.can_reannotate,
            "can_chatbot": tier.can_chatbot,
            "can_active_learn": tier.can_active_learn,
            "can_diagnose": tier.can_diagnose
        }
        plans.append(plans_details)
        
    return plans