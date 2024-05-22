# Libraries
from flask import session, Blueprint

# Local dependencies
from app.db import Farm
from app.authentication import permissions_required

# Initialize
router = Blueprint("farm", __name__)
# All routes under farm would be  /api/user/farm/*

@router.route("/query_all_farms_owned", methods=["GET"])
@permissions_required(is_user=True)
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

