# Libraries
from flask import session, Blueprint, request, current_app
from base64 import encodebytes
from datetime import date 

# Local dependencies
from app.db import Farm, TypeOfUser
from app.authentication import roles_required

# Initialize
router = Blueprint("farm", __name__)
# All routes under farm would be  /api/user/farm/*

@router.route("/query_all_farms_owned", methods=["GET"])
@roles_required(*TypeOfUser.all_users())
def query_all_farms_owned() -> dict[str, list[str|float]]:
	farms = []
	for farm in Farm.queryAllFarmsOwned(session["email"]):
		farms.append({
			"name": farm.name,
			"city": farm.city,
			"country": farm.country,
			"address": farm.address,
			"land_size": farm.land_size
		})
	return {"farms": farms}

