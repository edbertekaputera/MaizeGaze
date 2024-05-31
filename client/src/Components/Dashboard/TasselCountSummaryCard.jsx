import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Label, Select, Spinner } from "flowbite-react";
import {
	differenceInDays,
	isAfter,
	isBefore,
	isThisMonth,
	isThisQuarter,
	isThisWeek,
	isThisYear,
	subDays,
} from "date-fns";
import TasselCountChart from "./TasselCountChart";
import DoubleDatePicker from "../DoubleDatePicker";
import { GiCorn } from "react-icons/gi";
import { PiFarmFill } from "react-icons/pi";

function TasselCountSummaryCard({ className }) {
	const [data, setData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [farm, setFarm] = useState([]);
	const [filter, setFilter] = useState({
		farm_name: "all",
		startDate: -1,
		endDate: new Date(),
		unit: "day",
	});

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
					const date_obj = new Date(
						splitted_date[0],
						parseInt(splitted_date[1]) - 1,
						splitted_date[2]
					);
					return { ...items, record_date: date_obj };
				});

				setData(preprocessed_date);

				const min_date = preprocessed_date.reduce(
					(min, value) =>
						isBefore(min, value.record_date) ? min : value.record_date,
					new Date()
				);
				const max_date = preprocessed_date.reduce(
					(max, value) =>
						isAfter(max, value.record_date) ? max : value.record_date,
					0
				);

				const range_date = differenceInDays(max_date, min_date);
				if (range_date >= 730) {
					setFilter((prev) => ({ ...prev, unit: "year" }));
				} else if (range_date >= 180) {
					setFilter((prev) => ({ ...prev, unit: "quarter" }));
				} else if (range_date >= 60) {
					setFilter((prev) => ({ ...prev, unit: "month" }));
				}
			})
			.catch((error) => {
				console.log(error);
				alert("ERROR");
			})
			.then(setIsLoading(false));
	}, []);

	const getThisWeekTotal = () => {
		return data.reduce((total, result) => {
			return (total =
				isThisWeek(result.record_date) &&
				(filter.farm_name == "all" || filter.farm_name == result.farm_name)
					? total + result.tassel_count
					: total);
		}, 0);
	};

	const getThisMonthTotal = () => {
		return data.reduce((total, result) => {
			return (total =
				isThisMonth(result.record_date) &&
				(filter.farm_name == "all" || filter.farm_name == result.farm_name)
					? total + result.tassel_count
					: total);
		}, 0);
	};

	const getThisQuarterTotal = () => {
		return data.reduce((total, result) => {
			return (total =
				isThisQuarter(result.record_date) &&
				(filter.farm_name == "all" || filter.farm_name == result.farm_name)
					? total + result.tassel_count
					: total);
		}, 0);
	};

	const getThisYearTotal = () => {
		return data.reduce((total, result) => {
			return (total =
				isThisYear(result.record_date) &&
				(filter.farm_name == "all" || filter.farm_name == result.farm_name)
					? total + result.tassel_count
					: total);
		}, 0);
	};

	const getFilteredData = () => {
		return data.filter(
			(result) =>
				filter.farm_name == "all" || filter.farm_name == result.farm_name
		);
	};

	const getDailyAverage = () => {
		let filtered_data = getFilteredData();
		return (
			Math.round(
				(filtered_data.reduce((a, b) => a + b.tassel_count, 0) /
					filtered_data.length) *
					100
			) / 100
		).toFixed(2);
	};

	return (
		<>
			<Card className={"shadow-lg border " + className}>
				<header className="flex flex-wrap flex-row gap-2 justify-end items-center shadow-b pb-2 border-black">
					<Select
						icon={PiFarmFill}
						id="farm_input"
						value={filter.farm_name}
						color="success"
						className="shadow drop-shadow-md rounded-lg hover:outline outline-custom-green-2"
						onChange={(ev) =>
							setFilter((prev) => ({
								...prev,
								farm_name: ev.target.value,
							}))
						}
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
				) : getFilteredData().length == 0 ? (
					<div className="flex justify-center py-4">
						No Detection Results yet.
					</div>
				) : (
					<>
						<section className="grid grid-cols-2 md:grid-cols-4 gap-4">
							<div className="bg-custom-green-3 shadow p-4 rounded-lg flex flex-col justify-center items-center text-center">
								<h2 className="text-xl mb-3 font-bold drop-shadow-sm">
									Week
								</h2>
								<span className="flex flex-row items-center gap-1 text-3xl font-semibold text-custom-green-1">
									{getThisWeekTotal()}
									<GiCorn />
								</span>
							</div>
							<div className="bg-custom-green-3 shadow p-4 rounded-lg flex flex-col justify-center items-center text-center">
								<h2 className="text-xl mb-3 font-bold drop-shadow-sm">
									Month
								</h2>
								<span className="flex flex-row items-center gap-1 text-3xl font-semibold text-custom-green-1">
									{getThisMonthTotal()}
									<GiCorn />
								</span>
							</div>
							<div className="bg-custom-green-3 shadow p-4 rounded-lg flex flex-col justify-center items-center text-center">
								<h2 className="text-xl mb-3 font-bold drop-shadow-sm">
									Quarter
								</h2>
								<span className="flex flex-row items-center gap-1 text-3xl font-semibold text-custom-green-1">
									{getThisQuarterTotal()}
									<GiCorn />
								</span>
							</div>
							<div className="bg-custom-green-3 shadow p-4 rounded-lg flex flex-col justify-center items-center text-center">
								<h2 className="text-xl mb-3 font-bold drop-shadow-sm">
									Year
								</h2>
								<span className="flex flex-row items-center gap-1 text-3xl font-semibold text-custom-green-1">
									{getThisYearTotal()}
									<GiCorn />
								</span>
							</div>
						</section>
						<section className="flex flex-col sm:flex-row w-full justify-between sm:items-center mt-2 gap-4">
							<div className="flex flex-col items-start">
								<span className="text-lg">Daily Average :</span>
								<span className="text-2xl font-bold">
									{getDailyAverage()}
								</span>
							</div>
							<div className="flex flex-col sm:flex-row gap-4">
								<DoubleDatePicker
									filter={filter}
									setFilter={setFilter}
									min_date_key="startDate"
									max_date_key="endDate"
								/>
								<div>
									<Label className="mb-1 text-sm font-semibold">
										Time Unit:
									</Label>
									<Select
										id="unit_input"
										value={filter.unit}
										color="gray"
										className="rounded-lg hover:outline outline-1"
										onChange={(ev) =>
											setFilter((prev) => ({
												...prev,
												unit: ev.target.value,
											}))
										}
									>
										<option key={"day"} value={"day"}>
											Day
										</option>
										<option key={"month"} value={"month"}>
											Month
										</option>
										<option key={"quarter"} value={"quarter"}>
											Quarter
										</option>
										<option key={"year"} value={"year"}>
											Year
										</option>
									</Select>
								</div>
							</div>
						</section>

						<section className="mt-8 w-full">
							<TasselCountChart
								data={getFilteredData()}
								startDate={filter.startDate}
								endDate={filter.endDate}
								unit={filter.unit}
								daily_average={getDailyAverage()}
							/>
						</section>
					</>
				)}
			</Card>
		</>
	);
}

export default TasselCountSummaryCard;
