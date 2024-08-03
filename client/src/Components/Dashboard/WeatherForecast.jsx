import React, { useEffect, useState } from "react";
import { TiWeatherPartlySunny, TiWeatherStormy, TiWeatherSunny } from "react-icons/ti";
import { BsCloudDrizzle, BsCloudFog2, BsCloudHail, BsCloudRain, BsCloudSnow, BsFillCloudSnowFill } from "react-icons/bs";
import { FaCalendar, FaCloudShowersHeavy } from "react-icons/fa";
import { WiStormShowers } from "react-icons/wi";
import { RiSnowyLine } from "react-icons/ri";
import { Card, Label, Select, Spinner, Tooltip } from "flowbite-react";
import { MdOutlineWrongLocation } from "react-icons/md";
import { format, setDate } from "date-fns";
import WeatherForecastChart from "./WeatherForecastChart";

function WeatherForecast({ className, weatherData, locationData, isLoading, error_msg }) {
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

	const [filter, setFilter] = useState({
		measurement: "",
		date: "",
		type: "area",
		show_label: true,
	});

	const listOfMeasurements = {
		daily: ["precipitation_hours", "precipitation_probability_max", "precipitation_sum", "temperature_2m", "uv_index_max"],
		hourly: ["precipitation", "precipitation_probability", "temperature_2m"],
	};

	useEffect(() => {
		if (weatherData) {
			setFilter((prev) => ({
				...prev,
				date: "all",
				measurement: listOfMeasurements.daily[0],
			}));
		}
	}, [weatherData]);

	return (
		<>
			<Card className={"shadow-lg border " + className}>
				{isLoading ? (
					<div className="flex justify-center py-4 items-center gap-4 text-s text-custom-green-1">
						<Spinner size={"xl"} color={"success"} />
						Retrieving Weather Data.
					</div>
				) : weatherData ? (
					<div className="flex flex-col">
						<header>
							<h3 className="text-sm text-gray-500">Current Location</h3>
							<h2 className="text-xl font-medium">
								{locationData.city}, {locationData.country}
							</h2>
						</header>
						<section className="flex flex-col sm:flex-row gap-y-4 items-center justify-between mt-5 rounded-lg shadow-md border bg-custom-green-3 py-4 px-8">
							<div className="flex flex-col justify-center items-center w-48">
								<div className="text-8xl text-center">{weatherCodeMap[weatherData.current.weather_code].icon}</div>
								<p className="mt-2 text-center">{weatherCodeMap[weatherData.current.weather_code].description}</p>
							</div>
							<div className="flex flex-col justify-center items-center gap-1">
								<span className="text-4xl font-medium text-center">Today</span>
								<span className="text-gray-500 text-center">{format(new Date(), "EEEE, do MMMM yyyy")}</span>
							</div>
							<div className="flex flex-col justify-center items-center">
								<div className="text-6xl text-center font-medium">
									{`${weatherData.current.temperature_2m}${weatherData.current_units.temperature_2m}`}
								</div>
								<div className="flex flex-row gap-3 justify-center">
									<span className="font-medium">H: {`${weatherData.daily.temperature_2m_max[0]}${weatherData.daily_units.temperature_2m_max}`}</span>
									<span className="font-medium">L: {`${weatherData.daily.temperature_2m_min[0]}${weatherData.daily_units.temperature_2m_min}`}</span>
								</div>
							</div>
						</section>
						<section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-6 mt-5">
							{weatherData.daily.time.map((t, i) => {
								return (
									<div
										key={i}
										className="flex flex-col bg-custom-green-3 justify-center items-center px-4 py-2 shadow-md outline-gray-500 rounded-lg gap-1"
									>
										<span className="font-medium mb-2">{i == 0 ? "Today" : format(t, "do MMM")}</span>
										<Tooltip content={weatherCodeMap[weatherData.daily.weather_code[i]].description}>
											<span className="text-6xl text-center">{weatherCodeMap[weatherData.daily.weather_code[i]].icon}</span>
										</Tooltip>
										<Tooltip
											content={`Max Precipitation Probability is 
											${weatherData.daily.precipitation_probability_max[i]}${weatherData.daily_units.precipitation_probability_max}
											with Estimated Precipitation Sum of ${weatherData.daily.precipitation_sum[i]}${weatherData.daily_units.precipitation_sum}`}
										>
											<span className="text-blue-900">
												{weatherData.daily.precipitation_probability_max[i]}
												{weatherData.daily_units.precipitation_probability_max}
											</span>
										</Tooltip>
										<div className="flex flex-col 2xl:flex-row text-xs gap-1 justify-center 2xl:justify-between">
											<span className="font-medium">
												H: {`${weatherData.daily.temperature_2m_max[i]}${weatherData.daily_units.temperature_2m_max}`}
											</span>
											<span className="font-medium">
												L: {`${weatherData.daily.temperature_2m_min[i]}${weatherData.daily_units.temperature_2m_min}`}
											</span>
										</div>
									</div>
								);
							})}
						</section>
						<section className="flex flex-col sm:flex-row w-full justify-between sm:items-center mt-5 gap-4">
							<div className="flex flex-row sm:items-center gap-4">
								<Select
									id="type_input"
									value={filter.type}
									color="gray"
									className="rounded-lg hover:outline outline-1 w-1/2 sm:w-fit"
									onChange={(ev) =>
										setFilter((prev) => ({
											...prev,
											type: ev.target.value,
										}))
									}
								>
									<option key={"area"} value={"area"}>
										Line
									</option>
									<option key={"bar"} value={"bar"}>
										Bar
									</option>
								</Select>
								<label className="inline-flex items-center cursor-pointer">
									<input
										type="checkbox"
										checked={filter.show_label}
										className="sr-only peer"
										onChange={(ev) =>
											setFilter((prev) => ({
												...prev,
												show_label: ev.target.checked,
											}))
										}
									/>
									<div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-custom-green-2  rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all peer-checked:bg-custom-green-1"></div>
									<span className="ms-3 sm:ms-2 font-medium text-gray-900">Show Labels</span>
								</label>
							</div>
							<div className="flex flex-col sm:flex-row sm:items-center gap-4">
								<div>
									<Label className="mb-1 text-sm font-semibold">Date:</Label>
									<Select
										id="date_input"
										value={filter.date}
										color="gray"
										icon={FaCalendar}
										className="rounded-lg hover:outline outline-1"
										onChange={(ev) => {
											if (ev.target.value == "all" || filter.date == "all") {
												setFilter((prev) => ({
													...prev,
													date: ev.target.value,
													measurement: listOfMeasurements[ev.target.value == "all" ? "daily" : "hourly"][0],
												}));
											} else {
												setFilter((prev) => ({
													...prev,
													date: ev.target.value,
												}));
											}
										}}
									>
										<option key={"all"} value={"all"}>
											All
										</option>
										{weatherData.daily.time.map((d, i) => {
											const formatted_date = format(d, "dd MMM yyyy");
											return (
												<option key={i} value={d}>
													{formatted_date}
												</option>
											);
										})}
									</Select>
								</div>
								<div>
									<Label className="mb-1 text-sm font-semibold">Measurement:</Label>
									<Select
										id="measurement_input"
										value={filter.measurement}
										color="gray"
										className="rounded-lg hover:outline outline-1 min-w-64"
										onChange={(ev) =>
											setFilter((prev) => ({
												...prev,
												measurement: ev.target.value,
											}))
										}
									>
										{listOfMeasurements[filter.date == "all" ? "daily" : "hourly"].map((d, i) => {
											return (
												<option key={i} value={d}>
													{d}
												</option>
											);
										})}
									</Select>
								</div>
							</div>
						</section>
						<section className="mt-5 w-full">
							{filter.measurement && filter.date && (
								<WeatherForecastChart
									data={weatherData}
									date={filter.date}
									measurement={filter.measurement}
									type={filter.type}
									show_labels={filter.show_label}
								/>
							)}
						</section>
					</div>
				) : (
					<div className="flex justify-center py-4 items-center gap-2 text-red-600">
						<MdOutlineWrongLocation size={24} />
						<span>{error_msg}</span>
					</div>
				)}
			</Card>
		</>
	);
}

export default WeatherForecast;
