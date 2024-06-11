# Libraries
from flask import Blueprint, request, current_app
import requests

# Local dependencies
from app.authentication import permissions_required

# Initialize
router = Blueprint("weather", __name__)

@router.route("/get_weather_forecast", methods=["GET"])
# @permissions_required(is_user=True)
def get_weather_forecast() -> dict[str, int|str|dict]:
	latitude = request.args["latitude"]
	longitude = request.args["longitude"]
	# Get weather details
	params = {
		"timezone": "auto",
		"latitude": latitude,
		"longitude": longitude,
		"current": [
			"temperature_2m",
			"relative_humidity_2m",
			"apparent_temperature",
			"is_day",
			"precipitation",
			# "rain",
			# "showers",
			# "snowfall",
			"weather_code",
			# "cloud_cover",
			# "wind_speed_10m",
			# "wind_direction_10m",
		],
		"hourly": ["temperature_2m", "precipitation_probability", "precipitation", "weather_code"],
		"daily": [
			"weather_code",
			"temperature_2m_max",
			"temperature_2m_min",
			"uv_index_max",
			"precipitation_sum",
			"precipitation_hours",
			"precipitation_probability_max",
		],
	}

	weather_response = requests.get("https://api.open-meteo.com/v1/forecast", params=params)
	if weather_response.status_code != 200:
		return {"status_code": 400, "message": "Failed to Retrieve Weather Info."}
	weather_response_json =  weather_response.json()
	return {"status_code": 200, "data": weather_response_json}

@router.route("/get_location_info", methods=["GET"])
# @permissions_required(is_user=True)
def get_location_info() -> dict[str, int|str|dict]:
	latitude = request.args["latitude"]
	longitude = request.args["longitude"]
	# Reverse Geocode Location
	geocode_response = requests.get(f"https://geocode.maps.co/reverse", params={"lat": latitude, "lon": longitude, "api_key": current_app.config["REVERSE_GEOCODE_API"]})
	if geocode_response.status_code != 200:
		return {"status_code": 400, "message": "Failed to Retrieve Geolocation Info."}
	geocode_response_json = geocode_response.json()

	data = {
		"country": geocode_response_json["address"]["country"],
		"city": geocode_response_json["address"]["city"],
		"display_name": geocode_response_json["display_name"],
	}

	return {"status_code": 200, "data": data}
