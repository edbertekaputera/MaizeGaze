# Libraries
from flask import session, Blueprint, request
from uuid import uuid4

# Local dependencies
from app.db import Farm, CropPatch, DetectionResult
from app.authentication import permissions_required

# Initialize
router = Blueprint("farm", __name__)
# All routes under farm would be  /api/user/farm/*

@router.route("/query_all_farms_owned", methods=["GET"])
@permissions_required(is_user=True)
def query_all_farms_owned() -> dict[str, list[str|float]]:
	farms = []
	for farm in Farm.queryAllFarmsOwned(session["email"]):
		patches = []
		for p in CropPatch.queryAllOwnedByFarm(session["email"], farm.name):
			patches.append({
				"patch_id": p.patch_id,
				"land_size": p.land_size,
				"name": p.name
			})
		farms.append({
			"name": farm.name,
			"city": farm.city,
			"country": farm.country,
			"address": farm.address,
			"patches": patches
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

@router.route("/create_farm", methods=["POST"])
@permissions_required(is_user=True)
def create_farm() -> dict[str, int|str|list[str]]:
	details = request.get_json()
	if Farm.get(user=session["email"],name=details["name"]):
		return {"status_code": 400, "message": f"{details['name']} already exist."}
	# Create Farm
	success = Farm.create_farm(details={
		"name": details["name"],
		"city": details["city"],
		"country": details["country"],
		"address": details["address"],
		"description": details["description"],
		"user": session["email"]
	})
	if not success:
		return {"status_code": 400, "message": f"Failed to create New Farm '{details['name']}'."}
	# Create Patches
	list_of_fails = []
	for p in details["patches"]:
		success = CropPatch.createCropPatch(details={
			"patch_id": str(uuid4()),
			"name": p["name"],
			"land_size": p["land_size"],
			"farm_name": details["name"],
			"farm_user": session["email"]
		})
		if not success:
			list_of_fails.append(p["name"])
	if len(list_of_fails) == 0:
		return {"status_code": 201, "message": "Successfully created Farm."}
	return {
		"status_code": 400, 
		"message": f"Successfully created Farm, but Failed to create {len(list_of_fails)}/{len(details['patches'])} Crop Patches.", 
		"failed_patches": list_of_fails
	}

@router.route("/update_farm", methods=["PATCH"])
@permissions_required(is_user=True)
def update_farm() -> dict[str, int|str|list[str]]:
	json = request.get_json()
	json["user"] = session["email"]
	# Update Farm
	success = Farm.update_farm(details=json)
	if not success:
		return {"status_code": 400, "message": f"Failed to update Farm."}
	
	# Update Patch
	list_of_fails = []
	for p in json["patches"]:
		success = CropPatch.updateCropPatch(details={
			"farm_name": json["name"],
			"farm_user": json["user"],
			"patch_id": p["patch_id"],
			"name": p["name"],
			"land_size": p["land_size"],
			"deleted": p["deleted"],
		})
		if not success:
			list_of_fails.append(p["name"])
	if len(list_of_fails) == 0:
		return {"status_code": 200, "message": "Successfully updated Farm."}
	return {
		"status_code": 400, 
		"message": f"Successfully updated Farm, but Failed to update {len(list_of_fails)}/{len(json['patches'])} Crop Patches.", 
		"failed_patches": list_of_fails
	}
	
@router.route("/delete_farm", methods=["DELETE"])
@permissions_required(is_user=True)
def delete_farm() -> dict[str, int|str]:
	name = request.get_json()["name"]
	num_users = DetectionResult.queryNumOfResultByFarm(session["email"], name)
	if num_users > 0:
		return {"status_code": 400, "message": f"Failed! Farm '{name}' still has detection results linked to it."}
	
	success_patch = CropPatch.deleteAllOwnedByFarm(email=session["email"], farm_name=name)
	if not success_patch:
		return {"status_code": 400, "message": f"Failed! Tier to delete crop patches."}

	success = Farm.delete_farm(session["email"], name)
	if not success:
		return {"status_code": 400, "message": f"Failed to delete Farm '{name}'."}
	return {"status_code": 200, "message": f"Successfully deleted Farm '{name}'."}