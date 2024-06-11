import React from "react";
import { TiWeatherPartlySunny, TiWeatherStormy, TiWeatherSunny } from "react-icons/ti";
import { BsCloudDrizzle, BsCloudFog2, BsCloudHail, BsCloudRain, BsCloudSnow, BsFillCloudSnowFill } from "react-icons/bs";
import { FaCloudShowersHeavy } from "react-icons/fa";
import { WiStormShowers } from "react-icons/wi";
import { RiSnowyLine } from "react-icons/ri";
import { Card, Spinner } from "flowbite-react";
import { FaLocationArrow } from "react-icons/fa";
import { format } from "date-fns";

function CurrentWeatherCard({ weatherData, locationData, isLoading, error_msg }) {
	const weatherCodeMap = {
		0: { description: "Clear sky", icon: <TiWeatherSunny /> },
		1: { description: "Mainly clear, partly cloudy, and overcast", icon: <TiWeatherPartlySunny /> },
		2: { description: "Mainly clear, partly cloudy, and overcast", icon: <TiWeatherPartlySunny /> },
		3: { description: "Mainly clear, partly cloudy, and overcast", icon: <TiWeatherPartlySunny /> },
		45: { description: "Fog and depositing rime fog", icon: <BsCloudFog2 /> },
		48: { description: "Fog and depositing rime fog", icon: <BsCloudFog2 /> },
		51: { description: "Drizzle: Light, moderate, and dense intensity", icon: <BsCloudDrizzle /> },
		53: { description: "Drizzle: Light, moderate, and dense intensity", icon: <BsCloudDrizzle /> },
		55: { description: "Drizzle: Light, moderate, and dense intensity", icon: <BsCloudDrizzle /> },
		56: { description: "Freezing Drizzle: Light and dense intensity", icon: <BsCloudDrizzle className=" text-blue-300" /> },
		57: { description: "Freezing Drizzle: Light and dense intensity", icon: <BsCloudDrizzle className=" text-blue-300" /> },
		61: { description: "Rain: Slight, moderate and heavy intensity", icon: <BsCloudRain /> },
		63: { description: "Rain: Slight, moderate and heavy intensity", icon: <BsCloudRain /> },
		65: { description: "Rain: Slight, moderate and heavy intensity", icon: <BsCloudRain /> },
		66: { description: "Freezing Rain: Light and heavy intensity", icon: <BsCloudRain className=" text-blue-300" /> },
		67: { description: "Freezing Rain: Light and heavy intensity", icon: <BsCloudRain className=" text-blue-300" /> },
		71: { description: "Snow fall: Slight, moderate, and heavy intensity", icon: <RiSnowyLine /> },
		73: { description: "Snow fall: Slight, moderate, and heavy intensity", icon: <RiSnowyLine /> },
		75: { description: "Snow fall: Slight, moderate, and heavy intensity", icon: <RiSnowyLine /> },
		77: { description: "Snow grains", icon: <BsCloudHail /> },
		80: { description: "Rain showers: Slight, moderate, and violent", icon: <FaCloudShowersHeavy /> },
		81: { description: "Rain showers: Slight, moderate, and violent", icon: <FaCloudShowersHeavy /> },
		82: { description: "Rain showers: Slight, moderate, and violent", icon: <FaCloudShowersHeavy /> },
		85: { description: "Snow showers slight and heavy", icon: <BsCloudSnow /> },
		86: { description: "Snow showers slight and heavy", icon: <BsCloudSnow /> },
		95: { description: "Thunderstorm: Slight or moderate", icon: <TiWeatherStormy /> },
		96: { description: "Thunderstorm with slight and heavy hail", icon: <WiStormShowers /> },
		99: { description: "Thunderstorm with slight and heavy hail", icon: <WiStormShowers /> },
	};

	return (
		<div>
			<Card className="">
				{isLoading ? (
					<div className="flex justify-center py-4 items-center gap-4 text-s text-custom-green-1">
						<Spinner size={"xl"} color={"success"} />
						Retrieving Weather Data.
					</div>
				) : (
					<div className="relative flex-flex-col p-2 pb-0">
						<div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-4">
							<div className="flex flex-col justify-center">
								<h2 className="text-xl font-bold flex flex-row justify-center items-center gap-2">
									{locationData.city}, {locationData.country}
									<FaLocationArrow className="text-custom-green-1 text-xl" />
								</h2>
								<h3 className="text-gray-500 text-sm text-center sm:text-start">{format(new Date(), "EEEE, do MMMM yyyy")}</h3>
								<span className="text-4xl font-semibold mt-3 text-center sm:text-start">
									{weatherData ? `${weatherData.current.temperature_2m}${weatherData.current_units.temperature_2m}` : "?? °C"}
								</span>
							</div>
							<div className="text-8xl text-center sm:text-start">{weatherData && weatherCodeMap[weatherData.current.weather_code].icon}</div>
						</div>
						<p className="text-gray-500 mt-2">{weatherData ? weatherCodeMap[weatherData.current.weather_code].description : error_msg}</p>
						<div className="flex flex-col sm:flex-row justify-center mt-4 items-center">
							<a
								href="#weather_forecast"
								className="text-custom-green-1 font-medium p-2 rounded-lg hover:bg-gray-100 hover:shadow hover:outline-gray-200"
							>
								View more
							</a>
						</div>
					</div>
				)}
			</Card>
		</div>
	);
}

export default CurrentWeatherCard;
