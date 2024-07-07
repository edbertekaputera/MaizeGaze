# Libraries
from flask import session, Blueprint, request
import stripe
import datetime

# Local dependencies
from app.db import User, Suspension, TypeOfUser, DetectionQuota
from app.authentication import permissions_required
from app.storage import UserDirectory

# Initialize
router = Blueprint("tier_management", __name__)
# All routes under user_management would be  /api/admin/tier_management/*

@router.route("/create_tier", methods=["POST"])
@permissions_required(is_admin=True)
def create_tier() -> dict[str, int|str]:
	details = request.get_json()
	if TypeOfUser.get(details["name"]):
		return {"status_code": 400, "message": f"{details['name']} already exist."}
	# Create Stripe Product
	stripe_response = stripe.Product.create(
		name=details["name"], 
		default_price_data={
			"currency" : "sgd", 
			"recurring" : {"interval": "month", "interval_count": 1},
			"unit_amount": int(details["price"] * 100)
		}
	)
	details["stripe_product_id"] = stripe_response.id

	success, message = TypeOfUser.createTypeOfUser(details=details)
	return {"status_code": 201 if success else 400, "message": message}

@router.route("/update_tier", methods=["PATCH"])
@permissions_required(is_admin=True)
def update_tier() -> dict[str, int|str]:
	details = request.get_json()
	name = details["name"]
	tier = TypeOfUser.get(name)
	if not tier:
		return {"status_code": 400, "message": f"Failed! Tier '{name}' is not found."}
	try:
		if (details.get("price") is not None):
			retrieve_product_response = stripe.Product.retrieve(tier.stripe_product_id)
			retrieve_prices_response = stripe.Price.list(product=tier.stripe_product_id)
			new_price_id = ""
			for price in retrieve_prices_response.data:
				if price.unit_amount == int(details["price"] * 100):
					stripe.Price.modify(price.id, active=True) 
					new_price_id = price.id
					break
			if new_price_id == "":
				new_price = stripe.Price.create(currency="sgd", unit_amount=int(details["price"] * 100), product=tier.stripe_product_id, recurring={"interval": "month", "interval_count": 1})
				new_price_id = new_price.id

			# Update Price
			stripe.Product.modify(tier.stripe_product_id, default_price=new_price_id)
			stripe.Price.modify(retrieve_product_response.default_price, active=False) # type: ignore
			
	except Exception as err:
		print(err)
		return {"status_code": 400, "message": f"Failed to update tier '{details['name']}'."}

	success = TypeOfUser.updateTypeOfUser(details=details)
	if not success:
		return {"status_code": 400, "message": f"Failed to update tier '{details['name']}'."}
	return {"status_code": 200, "message": f"Successfully updated tier '{details['name']}'."}

@router.route("/delete_tier", methods=["DELETE"])
@permissions_required(is_admin=True)
def delete_tier() -> dict[str, int|str]:
	name = request.get_json()["name"]
	tier = TypeOfUser.get(name)
	if not tier:
		return {"status_code": 400, "message": f"Failed! Tier '{name}' is not found."}
	num_users = User.getNumOfUserByTier(name)
	if num_users > 0:
		return {"status_code": 400, "message": f"Failed! Tier '{name}' still has users subscribed to it."}
	# Archive Stripe Product
	try:
		stripe_response = stripe.Product.modify(tier.stripe_product_id, active=False)
		if stripe_response.active:
			return {"status_code": 400, "message": f"Failed to delete tier '{name}'."}
	except:
		return {"status_code": 400, "message": f"Failed to delete tier '{name}'."}

	success = TypeOfUser.delete(name)
	if not success:
		return {"status_code": 400, "message": f"Failed to delete tier '{name}'."}
	return {"status_code": 200, "message": f"Successfully deleted tier '{name}'."}

@router.route("/query_tier", methods=["GET"])
@permissions_required(is_admin=True)
def query_tier() -> dict[str, int|str|dict]:
	name = request.args["name"]
	num_users = User.getNumOfUserByTier(name)
	tier = TypeOfUser.get(name)
	if not tier:
		return {"status_code": 400, "message": f"Tier '{name}' not found."}
	return {
		"status_code": 200, 
		"data": {
			"name": tier.name,
			"detection_quota_limit": tier.detection_quota_limit,
			"storage_limit": tier.storage_limit,
			"price": tier.price,
			"can_reannotate": tier.can_reannotate,
			"can_chatbot": tier.can_chatbot,
			"can_active_learn": tier.can_active_learn,
			"can_diagnose": tier.can_diagnose,
			"num_users": num_users
		}
	}

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
			"storage_limit": t.storage_limit,
			"price": t.price,
			"num_users": User.getNumOfUserByTier(t.name)
		})
	return {"status_code": 200, "tiers": list_of_tiers}