# Libraries
from flask import session, Blueprint, current_app, redirect, abort, request
from flask_cors import cross_origin
import json
import stripe

# Local dependencies
from app.db import TypeOfUser, User
from app.authentication import permissions_required

# Initialize
router = Blueprint("subscsription", __name__)
# All routes under farm would be  /api/user/subscsription/*

@router.route("/purchase_plan", methods=["GET"])
@permissions_required(is_user=True)
def purchase_plan():
	try:
		tier_name = request.args["name"]
		tier = TypeOfUser.get(tier_name)
		if not tier:
			abort(404)
		product = stripe.Product.retrieve(tier.stripe_product_id)
		stripe_response = stripe.checkout.Session.create(
			customer_email=session["email"],
			mode="subscription",
			success_url=current_app.config["CLIENT_SERVER_URL"],
			line_items=[{
				"adjustable_quantity": {"enabled": False},
				"price": product.default_price, # type: ignore
				"quantity": 1
			}]
		)
		session.clear()
	except:
		abort(404)
	return {"url": stripe_response.url}

@router.route("/cancel_plan", methods=["POST"])
@permissions_required(is_user=True)
def cancel_plan() -> dict[str, int|str]:
	try:
		user = User.get(session["email"])
		if not user or user.user_type == "FREE_USER" or user.current_subscription_id is None:
			return {"status_code": 400, "message": "Failed to cancel Plan."}
		subscription_cancel_response = stripe.Subscription.cancel(user.current_subscription_id)
		customer = stripe.Customer.retrieve(str(subscription_cancel_response.customer))
		success = User.updatePlan(str(customer.email), "FREE_USER", None)
		if success:
			session.clear()
			return {"status_code": 200, "message": "Successfully Cancelled Plan."}
		return {"status_code": 400, "message": "Failed to cancel Plan."}
	except:
		return {"status_code": 400, "message": "Failed to cancel Plan."}


@router.route("/stripe_webhook_endpoint", methods=["POST"])
@cross_origin()
def stripe_webhook_endpoint() -> dict[str, bool]:
	event = None
	payload = request.data
	try:
		event = json.loads(payload)
	except json.decoder.JSONDecodeError as e:
		print('⚠️ Webhook error while parsing basic request.' + str(e))
		return {"success": False}

	if current_app.config["STRIPE_ENDPOINT_SECRET"]:
		# Only verify the event if there is an endpoint secret defined
		# Otherwise use the basic event deserialized with json
		sig_header = request.headers.get('stripe-signature')
		try:
			event = stripe.Webhook.construct_event(
				payload, sig_header, current_app.config["STRIPE_ENDPOINT_SECRET"]
			)
		except stripe.error.SignatureVerificationError as e: # type: ignore
			print('⚠️  Webhook signature verification failed.' + str(e))
			return {"success": False}

	# Handle the event (Purchase Plan)
	if event['type'] == 'checkout.session.completed':
		print('checkout.session.completed')
		event_data = event['data']['object']
		email = event_data["customer_email"]
		subscription = stripe.Subscription.retrieve(event_data["subscription"])
		product = stripe.Product.retrieve(str(subscription["items"]["data"][0].plan.product))
		success = User.updatePlan(email, product.name, subscription.id)
		return {"success": success}
	
	# Handle the event (Auto-Cancelled Plan)
	elif event['type'] == 'customer.subscription.deleted':
		subscription = event['data']['object']
		print('customer.subscription.deleted')
		customer = stripe.Customer.retrieve(subscription.customer)
		user = User.get(str(customer.email))
		if user and user.current_subscription_id:
			success = User.updatePlan(str(customer.email), "FREE_USER", None)
		return {"success": success}

	# ... handle other event types
	else:
		print('Unhandled event type {}'.format(event['type']))
	return {"success": True}

@router.route("/get_plan", methods=["GET"])
@ permissions_required(is_user=True)
def get_plan() -> dict[str, str]:
    plan_name = request.args["name"]
    tier = TypeOfUser.get(plan_name)
    return {
        "plan_name": tier.name,
        "plan_price": tier.price,
	}
