# Libraries
from flask import session, Blueprint, request
import datetime

# Local dependencies
from app.db import User, Suspension, TypeOfUser, DetectionQuota
from app.authentication import permissions_required
from app.storage import UserDirectory

# Initialize
router = Blueprint("tier_management", __name__)
# All routes under user_management would be  /api/admin/tier_management/*

@router.route("/query_all_tiers", methods=["GET"])
@permissions_required(is_admin=True)
def query_all_tiers() -> dict[str, int|str|list[dict[str, str|int|bool]]]:
	tiers = TypeOfUser.queryAll()
	list_of_tiers = []

	for t in tiers:
		if t.is_admin:
			continue
		list_of_tiers.append({
			"name": t.name,
			"detection_quota_limit": t.detection_quota_limit,
			"storage_limit": t.storage_limit 
		})
	return {"status_code": 200, "tiers": list_of_tiers}