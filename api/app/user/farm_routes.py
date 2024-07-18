# Libraries
from flask import session, Blueprint

# Local dependencies
from app.db import Farm, CropPatch
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
		})
	return {"farms": farms}

@router.route("/query_all_patches_owned", methods=["GET"])
@permissions_required(is_user=True)
def query_all_patches_owned() -> dict[str, list[str|float]]:
	patches = []
	for patch in CropPatch.queryAllCropPatchesOwned(session["email"]):
		patches.append({
			"farm_name": patch.farm_name,
			"patch_name": patch.name,
			"land_size": patch.land_size,
			"patch_id": patch.patch_id,
		})
	return {"patches": patches}

