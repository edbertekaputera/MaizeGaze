import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Button, Spinner } from "flowbite-react";
import { AuthContext } from "../Components/Authentication/PrivateRoute";
import { useNavigate } from "react-router-dom";
import TasselCountSummaryCard from "../Components/Dashboard/TasselCountSummaryCard";
import background_jumbotron from "../assets/corn_bg.png";
import { HiArrowNarrowRight } from "react-icons/hi";
import CurrentWeatherCard from "../Components/Dashboard/CurrentWeatherCard";
import WeatherForecast from "../Components/Dashboard/WeatherForecast";

function UserDashboard() {
	const { userInfo } = useContext(AuthContext);
	const navigate = useNavigate();
	const [weatherData, setWeatherData] = useState(null);
	const [locationData, setLocationData] = useState({
		city: "Unknown",
		country: "Unknown",
		display_name: "Unknown City",
	});
	const [error, setError] = useState("");
	const [isLoadingWeather, setIsLoadingWeather] = useState(true);

	useEffect(() => {
		const getLocationFromCookie = async () => {
			const locationCookie = document.cookie.split(";").find((cookie) => cookie.trim().startsWith("location="));

			if (locationCookie) {
				const [lat, long] = locationCookie.split("=")[1].split(",");
				queryCountryInfo(parseFloat(lat), parseFloat(long));
				queryWeather(parseFloat(lat), parseFloat(long));
			} else {
				requestLocationPermission();
			}
		};

		getLocationFromCookie();
	}, []);

	const setLocationCookie = (latitude, longitude) => {
		const maxAge = 30 * 24 * 60 * 60; // 30 days in seconds
		const expires = new Date(Date.now() + maxAge * 1000).toUTCString();
		document.cookie = `location=${latitude},${longitude};max-age=${maxAge};expires=${expires};path=/`;
	};

	const requestLocationPermission = async () => {
		try {
			const permissionStatus = await navigator.permissions.query({
				name: "geolocation",
			});
			if (permissionStatus.state === "granted") {
				await getLocation();
			} else if (permissionStatus.state === "prompt") {
				await getLocation();
			} else {
				setError("Location access denied. Please allow location access.");
				setIsLoadingWeather(false);
			}
		} catch (error) {
			console.log(error.message);
			setError("Error requesting location permission: " + error.message);
			setIsLoadingWeather(false);
		}
	};

	const getLocation = async () => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				async (position) => {
					setLocationCookie(position.coords.latitude, position.coords.longitude);
					await queryCountryInfo(position.coords.latitude, position.coords.longitude);
					await queryWeather(position.coords.latitude, position.coords.longitude);
					setError(null);
				},
				(err) => {
					setError("Unable to retrieve your location. Please allow location access.");
					console.error("Error getting location:", err);
					setIsLoadingWeather(false);
				}
			);
		} else {
			setError("Location services are not supported by this browser.");
			setIsLoadingWeather(false);
		}
	};

	const queryCountryInfo = async (latitude, longitude) => {
		await axios
			.get("/api/weather/get_location_info", {
				params: { latitude: latitude, longitude: longitude },
			})
			.then((res) => {
				if (res.data.status_code === 200) {
					setLocationData(res.data.data);
				} else {
					console.log(res.data.message);
				}
			})
			.catch((err) => {
				console.log(err);
			});
	};

	const queryWeather = async (lat, long) => {
		await axios
			.get("/api/weather/get_weather_forecast", {
				params: { latitude: lat, longitude: long },
			})
			.then((res) => {
				if (res.data.status_code === 200) {
					let data = res.data.data;
					data["current"]["time"] = new Date((res.data.data.current.time + res.data.data.utc_offset_seconds) * 1000);
					data["hourly"]["time"] = res.data.data.hourly.time.map((t) => new Date(t) + res.data.data.utc_offset_seconds * 1000);
					data["daily"]["time"] = res.data.data.daily.time.map((t) => new Date(t) + res.data.data.utc_offset_seconds * 1000);
					setWeatherData(data);
				} else {
					setError(res.data.message);
					console.log(res.data.message);
				}
			})
			.catch((err) => {
				setError("Failed to retrieve Weather Data.");
				console.log(err);
			})
			.then(() => setIsLoadingWeather(false));
	};

	console.log(weatherData);
	console.log(locationData);

	return (
		<div className="relative">
			<div className="min-h-screen flex flex-col">
				<section className="relative bg-gray-900 bg-blend-multiply pb-32 md:pb-24">
					<img src={background_jumbotron} className="z-0 absolute w-full opacity-20 min-h-192 max-h-screen" />
					<div className="relative px-4 mx-auto max-w-screen-xl text-center py-12 lg:py-16">
						<h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-white md:text-5xl lg:text-6xl">Welcome {userInfo.name}!</h1>
						<p className="mb-8 text-lg font-normal text-gray-300 lg:text-xl sm:px-16 lg:px-48">
							Here at <span className="text-custom-brown-2 font-bold">MaizeGaze</span> we provide you with a{" "}
							<span className="text-custom-brown-2 font-semibold ">cutting-edge deep learning technology</span> that allows the automation of tassel
							detection and calculation within a blink of an eye. Say goodbye to tiresome human labor and experience the future of agriculture!
						</p>
						<div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:gap-x-4">
							<Button
								className="bg-custom-green-2 hover:bg-custom-green-1 focus:ring-4 focus:ring-custom-green-3"
								onClick={() => navigate("/user/detect")}
							>
								<div className="flex flex-row justify-center items-center align-middle py-1 px-1 rounded-lg ">
									<span className="text-lg text-white font-medium">Start Detecting</span>
									<HiArrowNarrowRight className="text-center ml-2" size={24} />
								</div>
							</Button>
							<Button className="hover:text-gray-900 items-center py-1 px-1 sm:ms-4 text-base font-medium text-center text-white rounded-lg border border-white hover:bg-gray-100 focus:ring-4 focus:ring-gray-400"
							onClick={() => navigate("/user/profile")}>
								
								<div className="flex flex-row justify-center items-center align-middle py-1 px-1 rounded-lg ">
									<span className="text-lg font-medium">View My Profile</span>
								</div>
							</Button>
						</div>
					</div>
					<div className="z-20 px-2 absolute flex w-full justify-center text-black">
						<CurrentWeatherCard weatherData={weatherData} locationData={locationData} isLoading={isLoadingWeather} error_msg={error} />
					</div>
				</section>
				<section
					className={`z-10 bg-custom-white bg-cover bg-no-repeat flex flex-col px-4 lg:px-16 pb-5 ${
						isLoadingWeather ? "pt-5" : "pt-60 sm:pt-28 md:pt-40"
					}`}
				>
					<div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center mb-4 mt-5">
						<h1 className="text-3xl font-bold">Tassel Count Summary</h1>
						<a
							href="/user/result_history"
							className="text-custom-green-1 font-medium p-2 rounded-lg hover:bg-gray-100 hover:shadow hover:outline-gray-200"
						>
							View more
						</a>
					</div>
					<TasselCountSummaryCard />
				</section>
				<section id="weather_forecast" className="z-10 bg-custom-white bg-cover bg-no-repeat flex-1 flex flex-col pt-5 pb-10 px-4 lg:px-16 xl:pb-20">
					<div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center mb-4 mt-5">
						<h1 className="text-3xl font-bold">Weather Forecast</h1>
					</div>
					<WeatherForecast weatherData={weatherData} locationData={locationData} isLoading={isLoadingWeather} error_msg={error} />
				</section>
			</div>
		</div>
	);
}

export default UserDashboard;
