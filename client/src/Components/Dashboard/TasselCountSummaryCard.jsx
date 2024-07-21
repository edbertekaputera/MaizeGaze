import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Select, Spinner } from "flowbite-react";
import { format, isThisMonth, isThisQuarter, isThisWeek, isThisYear } from "date-fns";
import TasselCountChart from "./TasselCountChart";
import { GiCorn } from "react-icons/gi";
import { PiFarmFill } from "react-icons/pi";

function TasselCountSummaryCard({ className }) {
	const [data, setData] = useState([]);
	const [interpolatedData, setInterpolatedData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [farm, setFarm] = useState([]);
	const [selectedFarm, setSelectedFarm] = useState("all");
	const [showLabel, setShowLabel] = useState(true);
	const [showInterpolated, setShowInterpolated] = useState(false);

	useEffect(() => {
		axios
			.get("/api/user/farm/query_all_farms_owned")
			.then((res) => {
				if (res.status === 200) {
					setFarm(res.data.farms);
				} else {
					console.log(res.status);
					alert("Something went wrong!");
					navigate("/user");
				}
			})
			.catch((err) => {
				console.log(err);
				alert("Something went wrong!");
				navigate("/user");
			});

		axios
			.get("/api/storage/query_daily_statistics")
			.then((res) => {
				const preprocessed_date = res.data.result.map((items) => {
					const splitted_date = items.record_date.split("-");
					const date_obj = new Date(splitted_date[0], parseInt(splitted_date[1]) - 1, splitted_date[2]);
					return { ...items, record_date: date_obj };
				});
				setData(preprocessed_date);
			})
			.catch((error) => {
				console.log(error);
				alert("ERROR");
			})
			.then(setIsLoading(false));
	}, []);

	const handleTriggerInterpolate = (flag) => {
		if (flag && interpolatedData.length == 0) {
			axios
				.get("/api/storage/query_interpolated_daily_statistics")
				.then((res) => {
					const preprocessed_date = res.data.result.map((items) => {
						const splitted_date = items.record_date.split("-");
						const date_obj = new Date(splitted_date[0], parseInt(splitted_date[1]) - 1, splitted_date[2]);
						return { ...items, record_date: date_obj };
					});
					setInterpolatedData(preprocessed_date);
				})
				.catch((error) => {
					console.log(error);
					alert("ERROR");
				})
				.then(setIsLoading(false));
		}
		setShowInterpolated(flag);
	};

	const getThisWeekTotal = () => {
		if (showInterpolated) {
			return (
				Math.round(
					interpolatedData.reduce((total, result) => {
						return (total =
							isThisWeek(result.record_date) && (selectedFarm == "all" || selectedFarm == result.farm_name) ? total + result.tassel_count : total);
					}, 0) * 100
				) / 100
			).toFixed(2);
		}
		return data.reduce((total, result) => {
			return (total = isThisWeek(result.record_date) && (selectedFarm == "all" || selectedFarm == result.farm_name) ? total + result.tassel_count : total);
		}, 0);
	};

	const getThisMonthTotal = () => {
		if (showInterpolated) {
			return (
				Math.round(
					interpolatedData.reduce((total, result) => {
						return (total =
							isThisMonth(result.record_date) && (selectedFarm == "all" || selectedFarm == result.farm_name) ? total + result.tassel_count : total);
					}, 0) * 100
				) / 100
			).toFixed(2);
		}
		return data.reduce((total, result) => {
			return (total = isThisMonth(result.record_date) && (selectedFarm == "all" || selectedFarm == result.farm_name) ? total + result.tassel_count : total);
		}, 0);
	};

	const getThisQuarterTotal = () => {
		if (showInterpolated) {
			return (
				Math.round(
					interpolatedData.reduce((total, result) => {
						return (total =
							isThisQuarter(result.record_date) && (selectedFarm == "all" || selectedFarm == result.farm_name) ? total + result.tassel_count : total);
					}, 0) * 100
				) / 100
			).toFixed(2);
		}
		return data.reduce((total, result) => {
			return (total =
				isThisQuarter(result.record_date) && (selectedFarm == "all" || selectedFarm == result.farm_name) ? total + result.tassel_count : total);
		}, 0);
	};

	const getThisYearTotal = () => {
		if (showInterpolated) {
			return (
				Math.round(
					interpolatedData.reduce((total, result) => {
						return (total =
							isThisYear(result.record_date) && (selectedFarm == "all" || selectedFarm == result.farm_name) ? total + result.tassel_count : total);
					}, 0) * 100
				) / 100
			).toFixed(2);
		}
		return data.reduce((total, result) => {
			return (total = isThisYear(result.record_date) && (selectedFarm == "all" || selectedFarm == result.farm_name) ? total + result.tassel_count : total);
		}, 0);
	};

	const getFilteredData = (data_src) => {
		let filtered_data = {};
		data_src
			.filter((result) => selectedFarm == "all" || selectedFarm == result.farm_name)
			.forEach((val) => {
				if (!filtered_data[format(val.record_date, "yyyy-MM-dd")]) {
					filtered_data[format(val.record_date, "yyyy-MM-dd")] = val.tassel_count;
				} else {
					filtered_data[format(val.record_date, "yyyy-MM-dd")] += val.tassel_count;
				}
			});
		var filtered_data_list = Object.entries(filtered_data).map((x) => {
			const splitted_date = x[0].split("-");
			const date_obj = new Date(splitted_date[0], parseInt(splitted_date[1]) - 1, splitted_date[2]);
			return { record_date: date_obj, tassel_count: x[1] };
		});
		return filtered_data_list.sort((a, b) => {
			return a.record_date - b.record_date;
		});
	};

	const getDailyAverage = (data_src) => {
		let filtered_data = getFilteredData(data_src);
		return (Math.round((filtered_data.reduce((a, b) => a + b.tassel_count, 0) / filtered_data.length) * 100) / 100).toFixed(2);
	};

	return (
		<>
			<Card className={"shadow-lg border " + className}>
				<header className="flex flex-wrap flex-row gap-2 justify-end items-center shadow-b pb-2 border-black">
					<Select
						icon={PiFarmFill}
						id="farm_input"
						value={selectedFarm}
						color="success"
						className="shadow drop-shadow-md rounded-lg hover:outline outline-custom-green-2"
						onChange={(ev) => setSelectedFarm(ev.target.value)}
					>
						<option key={"all"} value={"all"}>
							All
						</option>
						{farm.map((f) => (
							<option key={f.name} value={f.name}>
								{f.name}
							</option>
						))}
					</Select>
				</header>
				{isLoading ? (
					<div className="flex justify-center py-4">
						<Spinner size={"xl"} color={"success"} />
					</div>
				) : getFilteredData(data).length == 0 ? (
					<div className="flex justify-center py-4">No Detection Results yet.</div>
				) : (
					<>
						<section className="grid grid-cols-2 md:grid-cols-4 gap-4">
							<div className="bg-custom-green-3 shadow p-4 rounded-lg flex flex-col justify-center items-center text-center">
								<h2 className="text-xl mb-3 font-bold drop-shadow-sm">
									Week{" "}
									{showInterpolated && (
										<span className="text-red-600">
											<br />
											(INTERPOLATED)
										</span>
									)}
								</h2>
								<span className="flex flex-row items-center gap-1 text-3xl font-semibold text-custom-green-1">
									{getThisWeekTotal()}
									<GiCorn />
								</span>
							</div>
							<div className="bg-custom-green-3 shadow p-4 rounded-lg flex flex-col justify-center items-center text-center">
								<h2 className="text-xl mb-3 font-bold drop-shadow-sm">
									Month{" "}
									{showInterpolated && (
										<span className="text-red-600">
											<br />
											(INTERPOLATED)
										</span>
									)}
								</h2>
								<span className="flex flex-row items-center gap-1 text-3xl font-semibold text-custom-green-1">
									{getThisMonthTotal()}
									<GiCorn />
								</span>
							</div>
							<div className="bg-custom-green-3 shadow p-4 rounded-lg flex flex-col justify-center items-center text-center">
								<h2 className="text-xl mb-3 font-bold drop-shadow-sm">
									Quarter{" "}
									{showInterpolated && (
										<span className="text-red-600">
											<br />
											(INTERPOLATED)
										</span>
									)}
								</h2>
								<span className="flex flex-row items-center gap-1 text-3xl font-semibold text-custom-green-1">
									{getThisQuarterTotal()}
									<GiCorn />
								</span>
							</div>
							<div className="bg-custom-green-3 shadow p-4 rounded-lg flex flex-col justify-center items-center text-center">
								<h2 className="text-xl mb-3 font-bold drop-shadow-sm">
									Year{" "}
									{showInterpolated && (
										<span className="text-red-600">
											<br />
											(INTERPOLATED)
										</span>
									)}
								</h2>
								<span className="flex flex-row items-center gap-1 text-3xl font-semibold text-custom-green-1">
									{getThisYearTotal()}
									<GiCorn />
								</span>
							</div>
						</section>
						<section className="flex flex-col sm:flex-row w-full justify-between sm:items-center mt-2 gap-4">
							<div className="flex flex-col items-start">
								<span className="text-lg">Daily Average {showInterpolated && <span className="text-red-600">(INTERPOLATED)</span>} :</span>
								<span className="text-2xl font-bold">{getDailyAverage(showInterpolated ? interpolatedData : data)}</span>
							</div>
							<div className="flex flex-col sm:flex-row sm:items-center gap-x-6 gap-y-4">
								<label className="inline-flex items-center cursor-pointer">
									<input
										type="checkbox"
										checked={showInterpolated}
										className="sr-only peer"
										onChange={(ev) => handleTriggerInterpolate(ev.target.checked)}
									/>
									<div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-custom-green-2  rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all peer-checked:bg-custom-green-1"></div>
									<span className="ms-3 sm:ms-2 font-medium text-gray-900">Show Interpolated Results</span>
								</label>
								<label className="inline-flex items-center cursor-pointer">
									<input type="checkbox" checked={showLabel} className="sr-only peer" onChange={(ev) => setShowLabel(ev.target.checked)} />
									<div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-custom-green-2  rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all peer-checked:bg-custom-green-1"></div>
									<span className="ms-3 sm:ms-2 font-medium text-gray-900">Show Labels</span>
								</label>
							</div>
						</section>
						<section className="w-full ">
							{interpolatedData.length > 0 && showInterpolated ? (
								<TasselCountChart
									data={getFilteredData(data)}
									daily_average={getDailyAverage(data)}
									interpolated_data={getFilteredData(interpolatedData)}
									interpolated_daily_average={getDailyAverage(interpolatedData)}
									show_labels={showLabel}
								/>
							) : (
								<TasselCountChart data={getFilteredData(data)} daily_average={getDailyAverage(data)} show_labels={showLabel} />
							)}
						</section>
					</>
				)}
			</Card>
		</>
	);
}

export default TasselCountSummaryCard;
